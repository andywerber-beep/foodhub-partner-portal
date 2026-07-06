import React, { useState, useRef } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { supabase } from '../../lib/supabaseClient';

export const MenuManager: React.FC = () => {
  const { partner } = usePartner();
  const [subTab, setSubTab] = useState<'menu' | 'offers'>('menu');
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [drawerType, setDrawerType] = useState<'item' | 'document'>('item');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Field States
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Mains');
  const [price, setPrice] = useState('12.50');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDrawer = (type: 'item' | 'document') => {
    setDrawerType(type);
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setItemName('');
    setPrice('12.50');
    setDescription('');
    setMediaUrl(null);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !partner?.id) return;

    setIsUploading(true);
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${partner.id}/${Date.now()}.${fileExtension}`;
      
      const { error } = await supabase.storage
        .from('venue-media')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('venue-media')
        .getPublicUrl(fileName);

      setMediaUrl(publicUrlData.publicUrl);
    } catch (err) {
      console.error('Asset camera upload exception triggered:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner?.id || !itemName) return;

    setIsSaving(true);
    try {
      if (subTab === 'menu') {
        const { error } = await supabase.from('menus').insert([{
          venue_id: partner.id,
          name: itemName,
          category: category,
          price: parseFloat(price) || 0,
          description: description,
          image_url: mediaUrl,
          created_at: new Date().toISOString()
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('offers').insert([{
          venue_id: partner.id,
          title: itemName,
          description: description,
          discount_price: parseFloat(price) || 0,
          image_url: mediaUrl,
          created_at: new Date().toISOString()
        }]);
        if (error) throw error;
      }

      handleCloseDrawer();
      window.location.reload(); 
    } catch (err) {
      console.error('Error committing registry configuration:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ textAlign: 'left', background: '#141414', padding: '32px', borderRadius: '16px', border: '1px solid #222' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Menus & Live Offers Management</h3>
          <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0 0' }}>Configure digital variants or push promotional flash updates straight to customer maps.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleOpenDrawer('document')}
            style={{
              padding: '12px 22px',
              borderRadius: '100px',
              border: '1px solid #2a2a2a',
              backgroundColor: '#1c1c1c',
              color: '#eee',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.3)',
              transition: 'transform 0.1s ease, background-color 0.2s',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            📷 Upload Menu Document
          </button>
          
          <button
            onClick={() => handleOpenDrawer('item')}
            style={{
              padding: '12px 22px',
              borderRadius: '100px',
              border: 'none',
              backgroundColor: '#FF6B6B',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(255,107,107,0.35), inset 0 1px 1px rgba(255,255,255,0.2)',
              transition: 'transform 0.1s ease, background-color 0.2s'
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            + Add New Entry
          </button>
        </div>
      </div>

      {showDrawer && (
        <div style={{ 
          backgroundColor: '#1a1a1a', 
          border: '1px solid #2a2a2a', 
          borderRadius: '14px', 
          padding: '28px', 
          marginBottom: '32px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02), 0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #262626', paddingBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
              {drawerType === 'document' ? 'Upload Menu Document Asset' : `Add New Custom ${subTab === 'menu' ? 'Menu Item' : 'Flash Offer'}`}
            </h4>
            <button onClick={handleCloseDrawer} style={{ background: 'transparent', border: 'none', color: '#666', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
          </div>

          {drawerType === 'document' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #333', padding: '40px', borderRadius: '10px', backgroundColor: '#141414', textAlign: 'center' }}>
              <input type="file" accept="image/*,application/pdf" ref={fileInputRef} onChange={handleMediaUpload} style={{ display: 'none' }} />
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#aaa' }}>Select a physical high-res photo or document sheet of your current menu layout.</p>
              <button 
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '10px 20px', borderRadius: '100px', backgroundColor: isUploading ? '#333' : '#FF6B6B', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                {isUploading ? 'Uploading Media Pipeline...' : 'Select File Source'}
              </button>
              {mediaUrl && <div style={{ marginTop: '14px', color: '#4CD137', fontSize: '13px', fontWeight: 600 }}>✓ File processed and hosted successfully!</div>}
            </div>
          ) : (
            <form onSubmit={handleSaveItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#666', marginBottom: '6px', letterSpacing: '0.5px' }}>ITEM TITLE / NAME</label>
                  <input required type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Woodfired Pizza" style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #262626', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                </div>

                {subTab === 'menu' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#666', marginBottom: '6px', letterSpacing: '0.5px' }}>CATEGORY CLASSIFICATION</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #262626', borderRadius: '6px', color: '#fff' }}>
                      <option>Mains</option>
                      <option>Starters</option>
                      <option>Desserts</option>
                      <option>Drinks</option>
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#666', marginBottom: '6px', letterSpacing: '0.5px' }}>BASE RETAIL VALUE (£)</label>
                  <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #262626', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#666', marginBottom: '6px', letterSpacing: '0.5px' }}>COMPREHENSIVE ENTRY DESCRIPTION</label>
                  <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="List ingredients or preparation callouts..." style={{ width: '100%', padding: '12px', background: '#121212', border: '1px solid #262626', borderRadius: '6px', color: '#fff', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#666', marginBottom: '6px', letterSpacing: '0.5px' }}>ITEM VISUAL (OPTIONAL)</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleMediaUpload} style={{ display: 'none' }} />
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ padding: '10px 16px', borderRadius: '6px', backgroundColor: '#222', border: '1px solid #333', color: '#ccc', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {isUploading ? 'Processing...' : '📷 Snap/Attach Photo'}
                    </button>
                    {mediaUrl && <span style={{ color: '#4CD137', fontSize: '12px', fontWeight: 600 }}>✓ Loaded</span>}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving || isUploading}
                  style={{ marginTop: '4px', width: '100%', padding: '14px', borderRadius: '6px', backgroundColor: '#FF6B6B', color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                >
                  {isSaving ? 'Committed Changes...' : 'Save and Publish Item'}
                </button>
              </div>

            </form>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #222', marginBottom: '24px', paddingBottom: '2px' }}>
        <button
          onClick={() => setSubTab('menu')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: subTab === 'menu' ? '2px solid #FF6B6B' : '2px solid transparent',
            color: subTab === 'menu' ? '#FF6B6B' : '#666666',
            padding: '8px 4px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Full Menu Registry
        </button>
        <button
          onClick={() => setSubTab('offers')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: subTab === 'offers' ? '2px solid #FF6B6B' : '2px solid transparent',
            color: subTab === 'offers' ? '#FF6B6B' : '#666666',
            padding: '8px 4px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Live Flash Offers
        </button>
      </div>

      <div style={{ 
        width: '100%', 
        minHeight: '260px', 
        border: '1px dashed #262626', 
        borderRadius: '12px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#101010',
        padding: '40px 20px',
        boxSizing: 'border-box'
      }}>
        <div style={{ textShadow: 'none', textAlign: 'center', maxWidth: '360px' }}>
          <p style={{ margin: 0, fontSize: '15px', color: '#555555', fontWeight: 500, lineHeight: '1.6' }}>
            No active items cataloged under this category view. Click either button above to build out your menu footprint.
          </p>
        </div>
      </div>

    </div>
  );
};

export default MenuManager;