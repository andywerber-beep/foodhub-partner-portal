import React, { useState, useEffect } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { supabase } from '../../lib/supabaseClient';

interface CombinedItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isLiveOffer: boolean;
  offerPrice?: number;
  originTable: 'menus' | 'offers';
}

export function MenuManager() {
  const { partner } = usePartner();
  const [items, setItems] = useState<CombinedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'offers'>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Mains');
  const [isLiveOffer, setIsLiveOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');

  const fetchMenuData = async () => {
    if (!partner?.id) return;
    try {
      const { data: menuData, error: menuError } = await supabase
        .from('menus')
        .select('*')
        .eq('venue_id', partner.id);

      const { data: offerData, error: offerError } = await supabase
        .from('offers')
        .select('*')
        .eq('venue_id', partner.id);

      if (menuError) throw menuError;
      if (offerError) throw offerError;

      const formattedMenus: CombinedItem[] = (menuData || []).map((m: any) => ({
        id: m.id.toString(),
        name: m.name,
        description: m.description || '',
        price: parseFloat(m.price),
        category: m.category || 'Mains',
        isLiveOffer: false,
        originTable: 'menus'
      }));

      const formattedOffers: CombinedItem[] = (offerData || []).map((o: any) => ({
        id: o.id.toString(),
        name: o.name,
        description: o.description || '',
        price: parseFloat(o.price),
        category: o.category || 'Mains',
        isLiveOffer: true,
        offerPrice: parseFloat(o.offer_price),
        originTable: 'offers'
      }));

      setItems([...formattedMenus, ...formattedOffers]);
    } catch (err) {
      console.error('Error querying platform registries:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dual-channel real-time sync hook
  useEffect(() => {
    if (!partner?.id) return;

    // Initial load
    setLoading(true);
    fetchMenuData();

    // Create a real-time channel to listen for any modifications to menus or offers tables
    const menuChannel = supabase
      .channel(`venue-updates-${partner.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'menus',
          filter: `venue_id=eq.${partner.id}`
        },
        () => {
          fetchMenuData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'offers',
          filter: `venue_id=eq.${partner.id}`
        },
        () => {
          fetchMenuData();
        }
      )
      .subscribe();

    // Clean up channel listener on component unmount
    return () => {
      supabase.removeChannel(menuChannel);
    };
  }, [partner?.id]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !partner?.id) return;

    try {
      if (isLiveOffer) {
        const { error } = await supabase
          .from('offers')
          .insert([{
            venue_id: partner.id,
            name,
            description,
            price: parseFloat(price),
            offer_price: offerPrice ? parseFloat(offerPrice) : parseFloat(price) * 0.9,
            category
          }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('menus')
          .insert([{
            venue_id: partner.id,
            name,
            description,
            price: parseFloat(price),
            category
          }]);
        if (error) throw error;
      }

      // Reset form states locally
      setName('');
      setDescription('');
      setPrice('');
      setIsLiveOffer(false);
      setOfferPrice('');
    } catch (err) {
      console.error('Error inserting item registry:', err);
    }
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'offers') return item.isLiveOffer;
    return true;
  });

  return (
    <div style={{ color: 'var(--text-primary)', width: '100%' }}>
      
      <div style={{ marginBottom: '32px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Menus & Live Offers Management</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Configure your digital menu and push promotional flash deals straight to partner venue maps.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
        
        <div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'all' ? 'var(--coral-accent)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
                padding: '4px 0',
                borderBottom: activeTab === 'all' ? '2px solid var(--coral-accent)' : '2px solid transparent',
              }}
            >
              Full Menu ({items.filter(i => !i.isLiveOffer).length})
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'offers' ? 'var(--coral-accent)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
                padding: '4px 0',
                borderBottom: activeTab === 'offers' ? '2px solid var(--coral-accent)' : '2px solid transparent',
              }}
            >
              🔥 Live Flash Offers ({items.filter(i => i.isLiveOffer).length})
            </button>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '20px 0', textAlign: 'left' }}>Synchronizing registry records...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredItems.length === 0 ? (
                <div style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '8px', textAlign: 'center', border: '1px dashed var(--border-color)', color: 'var(--text-secondary)' }}>
                  No active items cataloged under this category view.
                </div>
              ) : (
                filteredItems.map(item => (
                  <div 
                    key={`${item.originTable}-${item.id}`} 
                    style={{ 
                      background: 'var(--card-bg)', 
                      borderRadius: '8px', 
                      padding: '20px', 
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', background: 'var(--background-dark)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {item.category}
                        </span>
                        {item.isLiveOffer && (
                          <span style={{ fontSize: '11px', background: 'rgba(255,107,107,0.15)', color: 'var(--coral-accent)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            LIVE PROXIMITY OFFER
                          </span>
                        )}
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{item.name}</h3>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>{item.description}</p>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      {item.isLiveOffer && item.offerPrice ? (
                        <>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--coral-accent)' }}>£{item.offerPrice.toFixed(2)}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>£{item.price.toFixed(2)}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>£{item.price.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>Add New Item</h3>
          
          <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Item Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Woodfired Pizza"
                required
                style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Category Classification</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              >
                <option value="Mains">Mains</option>
                <option value="Sides">Sides</option>
                <option value="Drinks">Drinks</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Base Retail Price (£)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="12.50"
                required
                style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Menu Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="List ingredients or preparation dietary callouts..."
                rows={3}
                style={{ width: '100%', background: 'var(--background-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', boxSizing: 'border-box', resize: 'none' }}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={isLiveOffer}
                  onChange={(e) => setIsLiveOffer(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--coral-accent)' }}
                />
                <span>Set as Live Flash Offer</span>
              </label>
            </div>

            {isLiveOffer && (
              <div style={{ background: 'var(--background-dark)', padding: '12px', borderRadius: '6px', border: '1px solid var(--coral-accent)' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--coral-accent)', marginBottom: '6px', fontWeight: 700 }}>PROMOTIONAL FLASH PRICE (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="9.99"
                  required={isLiveOffer}
                  style={{ width: '100%', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '8px', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                background: 'var(--coral-accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px',
                transition: 'background-color 0.2s'
              }}
            >
              Add Item to Live Roster
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}