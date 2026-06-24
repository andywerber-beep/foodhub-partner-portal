import React, { useState, useEffect, useRef } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { MenuManager } from './MenuManager';
import { LedgerHistoryView } from './LedgerHistoryView';

export const ActiveDashboardView: React.FC = () => {
  const { partner } = usePartner();
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'menu' | 'ledger'>('overview');
  
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [proximityPingActive, setProximityPingActive] = useState<boolean>(true);

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  const venueName = partner?.name || 'Partner Venue Portal';
  const cuisineType = partner?.cuisine_type || 'Café / Fully Licensed'; // Correct spelling loaded from your context schema mapping
  const telephoneNumber = partner?.tel_number || 'Not Specified';

  const isMaltId = partner?.id?.toString() === '1' || venueName.toLowerCase().includes('malt');
  const lat = isMaltId ? 50.8114 : 50.8130; 
  const lng = isMaltId ? -0.3742 : -0.3705;

  useEffect(() => {
    if (activeTab === 'map' && mapRef.current && (window as any).google) {
      const google = (window as any).google;

      const mapOptions = {
        center: { lat, lng },
        zoom: 17, 
        disableDefaultUI: true,
        zoomControl: true
      };

      googleMapInstance.current = new google.maps.Map(mapRef.current, mapOptions);

      markerInstance.current = new google.maps.Marker({
        position: { lat, lng },
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

    return () => {
      if (markerInstance.current) {
        (window as any).google?.maps?.event?.clearInstanceListeners(markerInstance.current);
      }
    };
  }, [activeTab, partner, lat, lng, venueName]);

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', boxSizing: 'border-box' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {venueName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, marginTop: '4px' }}>
            Platform Version v6.2.1 • Status: <span style={{ color: '#4CD137', fontWeight: 600 }}>Active Portal Live</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'rgba(76, 209, 55, 0.1)', border: '1px solid #4CD137', color: '#4CD137', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
            ● Live on Map
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '12px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'overview' ? 'var(--coral-accent)' : 'transparent',
            color: activeTab === 'overview' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.2s'
          }}
        >
          📊 Performance Overview
        </button>
        <button
          onClick={() => setActiveTab('map')}
          style={{
            padding: '12px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'map' ? 'var(--coral-accent)' : 'transparent',
            color: activeTab === 'map' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.2s'
          }}
        >
          🗺️ Venue Map Settings
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            padding: '12px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'menu' ? 'var(--coral-accent)' : 'transparent',
            color: activeTab === 'menu' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.2s'
          }}
        >
          🍔 Menus & Live Offers
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          style={{
            padding: '12px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'ledger' ? 'var(--coral-accent)' : 'transparent',
            color: activeTab === 'ledger' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.2s'
          }}
        >
          💰 Financial Ledger
        </button>
      </div>

      {activeTab === 'overview' && (
        <div style={{ textAlign: 'left', background: 'var(--card-bg)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Account Summary</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '145%' }}>
            Welcome to your main control hub. This application is customized exclusively for partner venues to update live menu registries, execute digital offer updates, and track payment flows.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--background-dark)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>MARKETPLACE COMMISSION</span>
              <h4 style={{ fontSize: '32px', color: 'var(--coral-accent)', margin: 0, fontWeight: 700 }}>10.0%</h4>
            </div>
            <div style={{ backgroundColor: 'var(--background-dark)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>PLATFORM SERVICE FEE</span>
              <h4 style={{ fontSize: '32px', color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>£49.00<span style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 400 }}> /mo</span></h4>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div style={{ textAlign: 'left', background: 'var(--card-bg)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Venue Location Details</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>
                Verify map coordinates and hover overlays below used for custom proximity targeting.
              </p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', background: 'var(--background-dark)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <input 
                type="checkbox" 
                checked={proximityPingActive} 
                onChange={(e) => setProximityPingActive(e.target.checked)}
                style={{ accentColor: 'var(--coral-accent)' }}
              />
              <span style={{ color: 'var(--text-primary)' }}>15-Min Proximity Ping</span>
            </label>
          </div>
          
          <div style={{ position: 'relative', width: '100%', height: '360px', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

            {isHovered && (
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'var(--card-bg)',
                border: '2px solid var(--coral-accent)',
                padding: '16px',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                width: '240px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 1000,
                pointerEvents: 'none'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: 'var(--coral-accent)' }}>{venueName}</h4>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', background: 'var(--background-dark)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {cuisineType}
                </span>
                
                {proximityPingActive && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#4CD137', fontWeight: 700 }}>🔥 PROXIMITY DEAL ACTIVE</div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>Users close to your venue receive an instant smartphone proximity ping alert.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--background-dark)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '14px' }}>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Cuisine Category:</strong> <span style={{ color: 'var(--text-primary)' }}>{cuisineType}</span></div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Telephone Line:</strong> <span style={{ color: 'var(--text-primary)' }}>{telephoneNumber}</span></div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Street Address:</strong> <span style={{ color: 'var(--text-primary)' }}>{partner?.address1 || (isMaltId ? '167 Montague Street' : '29 Graham Road')} {partner?.address2 ? `, ${partner?.address2}` : ''}</span></div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Town/City:</strong> <span style={{ color: 'var(--text-primary)' }}>{partner?.town || 'Worthing'}</span></div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Postcode Sector:</strong> <span style={{ color: 'var(--text-primary)' }}>{partner?.postcode || 'BN11 3BZ'}</span></div>
          </div>
        </div>
      )}

      {activeTab === 'menu' && (
        <MenuManager />
      )}

      {activeTab === 'ledger' && (
        <LedgerHistoryView />
      )}
    </div>
  );
};

export default ActiveDashboardView;