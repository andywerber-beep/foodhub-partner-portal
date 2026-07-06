import React, { useState, useEffect, useRef } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { MenuManager } from './MenuManager';
import { LedgerHistoryView } from './LedgerHistoryView';
import { supabase } from '../../lib/supabaseClient';

export const ActiveDashboardView: React.FC = () => {
  const { partner } = usePartner();
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'menu' | 'ledger'>('overview');
  
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [proximityPingActive, setProximityPingActive] = useState<boolean>(true);
  const [hasActiveOffers, setHasActiveOffers] = useState<boolean>(false);

  // Performance Overview Metrics states
  const [metrics, setMetrics] = useState({
    dailyRevenue: '0.00',
    monthlyRevenue: '0.00',
    footfall: 0
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  const venueName = partner?.name || 'Partner Venue Portal';
  const cuisineType = partner?.cuisine_type || 'Café / Fully Licensed'; 
  const telephoneNumber = partner?.tel_number || 'Not Specified';

  // Check if this venue has any live offers to drive the map logic dynamically
  useEffect(() => {
    const checkOffers = async () => {
      if (!partner?.id) return;
      try {
        const { count, error } = await supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })
          .eq('venue_id', partner.id); // Maps to venue reference column
        
        if (!error && count !== null) {
          setHasActiveOffers(count > 0);
        }
      } catch (err) {
        console.error('Error checking active offers status matrix:', err);
      }
    };
    
    checkOffers();
  }, [partner?.id]);

  // Simulate real-time tracker analytics for the minimalist metrics grid
  useEffect(() => {
    if (partner?.id) {
      setMetrics({
        dailyRevenue: '342.50',
        monthlyRevenue: '4,890.00',
        footfall: 128
      });
    }
  }, [partner?.id]);

  useEffect(() => {
    if (activeTab === 'map' && mapRef.current && (window as any).google) {
      const google = (window as any).google;
      const streetAddress = partner?.address1 || '';
      const townCity = partner?.town || '';
      const zipPostcode = partner?.postcode || '';
      const fullGeocodeAddressString = `${streetAddress}, ${townCity}, ${zipPostcode}`.trim();

      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ address: fullGeocodeAddressString }, (results: any, status: string) => {
        if (status === 'OK' && results[0]) {
          const dynamicLocation = results[0].geometry.location;

          const mapOptions = {
            center: dynamicLocation,
            zoom: 17, 
            disableDefaultUI: true,
            zoomControl: true
          };

          googleMapInstance.current = new google.maps.Map(mapRef.current, mapOptions);

          markerInstance.current = new google.maps.Marker({
            position: dynamicLocation,
            map: googleMapInstance.current,
            title: venueName,
            animation: google.maps.Animation.DROP
          });

          markerInstance.current.addListener('mouseover', () => {
            setIsHovered(true);
          });

          markerInstance.current.addListener('mouseout', () => {
            setIsHovered(false);
          });
        }
      });
    }

    return () => {
      if (markerInstance.current) {
        (window as any).google?.maps?.event?.clearInstanceListeners(markerInstance.current);
      }
    };
  }, [activeTab, partner, venueName]);

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', boxSizing: 'border-box' }}>
      
      <header style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '32px', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.5px' }}>
            {venueName}
          </h1>
          <p style={{ color: '#888888', fontSize: '13px', margin: '4px 0 0 0' }}>
            Platform Version v6.2.1 • Status: <span style={{ color: '#4CD137', fontWeight: 600 }}>Active Portal Live</span>
          </p>
        </div>
        <div>
          <div style={{ backgroundColor: 'rgba(76, 209, 55, 0.1)', border: '1px solid #4CD137', color: '#4CD137', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.2px' }}>
            ● Live on Map
          </div>
        </div>
      </header>

      {/* Fluid Pill Tabs Design Container */}
      <nav style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '10px', marginBottom: '32px', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 18px',
            borderRadius: '100px',
            border: 'none',
            backgroundColor: activeTab === 'overview' ? '#FF6B6B' : '#1a1a1a',
            color: activeTab === 'overview' ? '#ffffff' : '#999999',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'overview' ? '0 4px 12px rgba(255,107,107,0.3)' : 'none'
          }}
        >
          📊 Performance Overview
        </button>
        <button
          onClick={() => setActiveTab('map')}
          style={{
            padding: '10px 18px',
            borderRadius: '100px',
            border: 'none',
            backgroundColor: activeTab === 'map' ? '#FF6B6B' : '#1a1a1a',
            color: activeTab === 'map' ? '#ffffff' : '#999999',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'map' ? '0 4px 12px rgba(255,107,107,0.3)' : 'none'
          }}
        >
          🗺️ Venue Map Settings
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            padding: '10px 18px',
            borderRadius: '100px',
            border: 'none',
            backgroundColor: activeTab === 'menu' ? '#FF6B6B' : '#1a1a1a',
            color: activeTab === 'menu' ? '#ffffff' : '#999999',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'menu' ? '0 4px 12px rgba(255,107,107,0.3)' : 'none'
          }}
        >
          🍔 Menus & Live Offers
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          style={{
            padding: '10px 18px',
            borderRadius: '100px',
            border: 'none',
            backgroundColor: activeTab === 'ledger' ? '#FF6B6B' : '#1a1a1a',
            color: activeTab === 'ledger' ? '#ffffff' : '#999999',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'ledger' ? '0 4px 12px rgba(255,107,107,0.3)' : 'none'
          }}
        >
          💰 Financial Ledger
        </button>
      </nav>

      {activeTab === 'overview' && (
        <div style={{ textAlign: 'left', background: '#141414', padding: '32px', borderRadius: '16px', border: '1px solid #222' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Performance Metrics</h3>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px', lineHeight: '1.5' }}>
            Track your venue's real-time financial traction and venue engagement data loops across the ecosystem layout.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: '#1a1a1a', padding: '24px', borderRadius: '12px', border: '1px solid #262626' }}>
              <span style={{ fontSize: '11px', color: '#888888', fontWeight: 700, display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>DAILY REVENUE</span>
              <h4 style={{ fontSize: '32px', color: '#ffffff', margin: 0, fontWeight: 800 }}>£{metrics.dailyRevenue}</h4>
            </div>
            <div style={{ backgroundColor: '#1a1a1a', padding: '24px', borderRadius: '12px', border: '1px solid #262626' }}>
              <span style={{ fontSize: '11px', color: '#888888', fontWeight: 700, display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>MONTHLY REVENUE</span>
              <h4 style={{ fontSize: '32px', color: '#FF6B6B', margin: 0, fontWeight: 800 }}>£{metrics.monthlyRevenue}</h4>
            </div>
            <div style={{ backgroundColor: '#1a1a1a', padding: '24px', borderRadius: '12px', border: '1px solid #262626' }}>
              <span style={{ fontSize: '11px', color: '#888888', fontWeight: 700, display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>CUSTOMER FOOTFALL</span>
              <h4 style={{ fontSize: '32px', color: '#4CD137', margin: 0, fontWeight: 800 }}>{metrics.footfall} <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>visits</span></h4>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div style={{ textAlign: 'left', background: '#141414', padding: '32px', borderRadius: '16px', border: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Venue Location Details</h3>
              <p style={{ color: '#888', fontSize: '13px', margin: '4px 0 0 0' }}>
                Verify map coordinates and hover overlays below used for custom proximity targeting.
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', background: '#1a1a1a', padding: '8px 14px', borderRadius: '100px', border: '1px solid #262626' }}>
              <input 
                type="checkbox" 
                checked={proximityPingActive} 
                onChange={(e) => setProximityPingActive(e.target.checked)}
                style={{ accentColor: '#FF6B6B' }}
              />
              <span style={{ color: '#fff', fontWeight: 500 }}>15-Min Proximity Ping</span>
            </label>
          </div>
          
          <div style={{ position: 'relative', width: '100%', height: '380px', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', border: '1px solid #262626' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

            {isHovered && (
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: '#1a1a1a',
                border: '1px solid #FF6B6B',
                padding: '16px',
                borderRadius: '12px',
                color: '#fff',
                width: '250px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
                zIndex: 1000,
                pointerEvents: 'none'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#FF6B6B' }}>{venueName}</h4>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', background: '#121212', padding: '2px 8px', borderRadius: '4px', color: '#888', fontWeight: 600 }}>
                  {cuisineType}
                </span>
                
                {proximityPingActive && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid #262626', paddingTop: '10px' }}>
                    {hasActiveOffers ? (
                      <>
                        <div style={{ fontSize: '11px', color: '#4CD137', fontWeight: 700, letterSpacing: '0.3px' }}>🔥 PROXIMITY DEAL ACTIVE</div>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#888', lineHeight: '1.4' }}>Users close to your venue receive an instant smartphone proximity ping alert.</p>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '11px', color: '#FFD23F', fontWeight: 700, letterSpacing: '0.3px' }}>⚠️ PING IDLE — NO OFFERS</div>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#888', lineHeight: '1.4' }}>Create a deal inside the menus tab to activate proximity background alerts.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#1a1a1a', padding: '24px', borderRadius: '12px', border: '1px solid #262626', fontSize: '13px' }}>
            <div><strong style={{ color: '#666', marginRight: '8px' }}>Cuisine Category:</strong> <span style={{ color: '#fff' }}>{cuisineType}</span></div>
            <div><strong style={{ color: '#666', marginRight: '8px' }}>Telephone Line:</strong> <span style={{ color: '#fff' }}>{telephoneNumber}</span></div>
            <div><strong style={{ color: '#666', marginRight: '8px' }}>Street Address:</strong> <span style={{ color: '#fff' }}>{partner?.address1 || ''} {partner?.address2 ? `, ${partner?.address2}` : ''}</span></div>
            <div><strong style={{ color: '#666', marginRight: '8px' }}>Town/City:</strong> <span style={{ color: '#fff' }}>{partner?.town || ''}</span></div>
            <div><strong style={{ color: '#666', marginRight: '8px' }}>Postcode Sector:</strong> <span style={{ color: '#fff' }}>{partner?.postcode || ''}</span></div>
          </div>
        </div>
      )}

      {activeTab === 'menu' && <MenuManager />}
      {activeTab === 'ledger' && <LedgerHistoryView />}
    </div>
  );
};

export default ActiveDashboardView;