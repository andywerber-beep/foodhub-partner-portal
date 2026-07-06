import React, { useState, useRef, useEffect } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { supabase } from '../../lib/supabaseClient';

export const MenuManager: React.FC = () => {
  const { partner } = usePartner();
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeOfferExists, setActiveOfferExists] = useState<boolean>(false);

  // Core Website Sync State
  const [websiteUrl, setWebsiteUrl] = useState<string>('');

  // Minimalist Flash Offer Form States (0-based defaults)
  const [offerTitle, setOfferTitle] = useState('');
  const [price, setPrice] = useState('0.00');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial configuration state data from Supabase maps
  useEffect(() => {
    const fetchVenueConfig = async () => {
      if (!partner?.id) return;
      try {
        // Fetch Website URL from partners matrix
        const { data: partnerData } = await supabase
          .from('partners')
          .select('website_url')
          .eq('id', partner.id)
          .maybeSingle();
        
        if (partnerData?.website_url) {
          setWebsiteUrl(partnerData.website_url);
        }

        // Fetch current active offer to verify state within 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: offerData } = await supabase
          .from('offers')
          .select('*')
          .eq('venue_id', partner.id)
          .gt('created_at', twentyFourHoursAgo)
          .maybeSingle();

        if (offerData) {
          setActiveOfferExists(true);
          setOfferTitle(offerData.title || '');
          setPrice(offerData.discount_price?.toString() || '0.00');
          setDescription(offerData.description || '');
          setMediaUrl(offerData.image_url || null);
        }
      } catch (err) {
        console.error('Error fetching layout routing settings:', err);
      }
    };

    fetchVenueConfig();
  }, [partner?.id]);

  const handleSaveWebsite = async () => {
    if (!partner?.id) return;
    try {
      await supabase
        .from('partners')
        .update({ website_url: websiteUrl })
        .eq('id', partner.id);
      alert('Website linked successfully.');
    } catch (err) {
      console.error('Error committing website update pipeline:', err);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !partner?.id) return;

    setIsUploading(true);
    try {
      // Deterministic fixed route destination paths to continuously overwrite old file assets seamlessly
      const fileName = `offers/${partner.id}.jpg`;
      
      const { error } = await supabase.storage
        .from('venue-media')
        .upload(fileName, file, { cacheControl: '60', upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('venue-media')
        .getPublicUrl(fileName);

      setMediaUrl(publicUrlData.publicUrl);
    } catch (err) {
      console.error('Asset snapshot uploader loop issue:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublishOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner?.id || !offerTitle) return;

    setIsSaving(true);
    try {
      // Clean up old references instantly before mounting a fresh push campaign
      await supabase.from('offers').delete().eq('venue_id', partner.id);

      const { error } = await supabase.from('offers').insert([{
        venue_id: partner.id,
        title: offerTitle,
        description: description,
        discount_price: parseFloat(price) || 0,
        image_url: mediaUrl,
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;

      setActiveOfferExists(true);
      setShowDrawer(false);
    } catch (err) {
      console.error('Error writing flash offer routing:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Instant emergency withdraw panic drop switch
  const handleWithdrawOffer = async () => {
    if (!partner?.id) return;
    if (!confirm('Withdraw this flash offer from customer map popups immediately?')) return;

    try {
      await supabase.from('offers').delete().eq('venue_id', partner.id);
      
      setActiveOfferExists(false);
      setOfferTitle('');
      setPrice('0.00');
      setDescription('');
      setMediaUrl(null);
      setShowDrawer(false);
    } catch (err) {
      console.error('Error dropping offer visibility rules:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Website Integration Sync Card */}
      <div style={{ textAlign: 'left', background: '#141414', padding: '24px', borderRadius: '16px', border: '1px solid #222' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 4px 0' }}>Menu Website Sync</h4>
        <p style={{ color: '#666', fontSize: '13px', margin: '0 0 16px 0' }}>Customers are redirected here directly from your active map pin popup layout to see your full menu choice array.</p>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', maxWidth: '600px' }}>
          <input 
            type="url" 
            value={websiteUrl} 
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourvenue.com/menu" 
            style={{ flex: 1, minWidth: '240px', padding: '12px', background: '#121212', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }}
          />
          <button 
            onClick={handleSaveWebsite}
            style={{ padding: '12px 24px', borderRadius: '100px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Link Website Menu
          </button>
        </div>
      </div>

      {/* 2. Live Offers Dashboard Area */}
      <div style={{ textAlign: 'left', background: '#141414', padding: '32px', borderRadius: '16px', border: '1px solid #222' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>Live Offers Management</h3>
            <p style={{ color: '#666', fontSize: '13px', margin: '4px 0 0 0' }}>Broadcast flash updates directly to local customer smartphone lock screens and active map locations.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {activeOfferExists && (
              <button
                onClick={handleWithdrawOffer}
                style={{
                  padding: '12px 22px',
                  borderRadius: '100px',
                  border: '1px solid rgba(235, 77, 75, 0.2)',
                  backgroundColor: 'rgba(235, 77, 75, 0.1)',
                  color: '#eb4d4b',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease'
                }}
              >
                🛑 Withdraw Active Offer
              </button>
            )}
            
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              style={{
                padding: '12px 22px',
                borderRadius: '100px',
                border: 'none',
                backgroundColor: '#FF6B6B',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255,107,107,0.3)'
              }}
            >
              {showDrawer ? 'Close Panel' : 'Add Offers'}
            </button>
          </div>
        </div>

        {/* Tactile Slide-Down Panel Input Container */}
        {showDrawer && (
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '28px', marginBottom: '32px' }}>
            <form onSubmit={handlePublishOffer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Text Parameters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#555', marginBottom: '6px', letterSpacing: '0.5px' }}>OFFER TITLE</label>
                  <input required type="text" value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} placeholder="e.g. 20% off all woodfired pizzas" style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #262626', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#555', marginBottom: '6px', letterSpacing: '0.5px' }}>PRICE (£)</label>
                  <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #262626', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Description & Camera Sync Split */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#555', marginBottom: '6px', letterSpacing: '0.5px' }}>ITEM DESCRIPTION</label>
                  <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ingredients..." style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #262626', borderRadius: '6px', color: '#fff', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#555', marginBottom: '6px', letterSpacing: '0.5px' }}>PROMOTIONAL THUMBNAIL (OPTIONAL)</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleMediaUpload} style={{ display: 'none' }} />
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ padding: '10px 16px', borderRadius: '6px', backgroundColor: '#222', border: '1px solid #333', color: '#ccc', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {isUploading ? 'Linking Asset...' : '📷 Snap/Attach Photo'}
                    </button>
                    {mediaUrl && <span style={{ color: '#4CD137', fontSize: '12px', fontWeight: 600 }}>✓ Loaded</span>}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving || isUploading}
                  style={{ marginTop: '4px', width: '100%', padding: '14px', borderRadius: '6px', backgroundColor: '#FF6B6B', color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                >
                  {isSaving ? 'Deploying Deal Alert Matrix...' : 'Publish Flash Offer Live'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Dynamic Display Layout State View */}
        <div style={{ 
          width: '100%', 
          minHeight: '220px', 
          border: activeOfferExists ? '1px solid #262626' : '1px dashed #222', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#101010',
          padding: '40px 20px',
          boxSizing: 'border-box'
        }}>
          {activeOfferExists ? (
            <div style={{ textAlign: 'left', width: '100%', maxWidth: '500px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              {mediaUrl && <img src={mediaUrl} alt="Offer Visual" style={{ width: '90px', height: '90px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #222' }} />}
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#4CD137', background: 'rgba(76,209,55,0.1)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px' }}>
                  ACTIVE FOR 24 HOURS
                </span>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800, color: '#fff' }}>{offerTitle}</h4>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#FF6B6B', marginBottom: '4px' }}>£{parseFloat(price).toFixed(2)}</div>
                {description && <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.4' }}>{description}</p>}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', maxWidth: '360px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#444', fontWeight: 500, lineHeight: '1.6' }}>
                No active promotional campaign live right now. Open the editor panel above to instantly drop an offer pin onto the consumer discovery map.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MenuManager;