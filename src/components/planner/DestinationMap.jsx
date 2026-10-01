import React, { useEffect, useRef, useState, useMemo } from 'react'
import L from 'leaflet'
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Maximize2,
  Minimize2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react'
import { isValidCoordinate, calculateTotalRouteDistance } from '../../services/geoService'
import { formatRupiah } from '../../utils/formatters'

/**
 * Custom SVG Marker Helper
 * Menghasilkan DivIcon modern dengan nomor urut, styling Tripin teal, dan status selected.
 */
function createCustomMarkerIcon(index, isSelected = false, label = '') {
  const bgClass = isSelected
    ? 'background: linear-gradient(135deg, #0F766E, #14B8A6); box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.35), 0 8px 16px -2px rgba(15, 118, 110, 0.4);'
    : 'background: #0F766E; box-shadow: 0 4px 10px -1px rgba(15, 23, 42, 0.25);'

  const size = isSelected ? 38 : 32
  const fontSize = isSelected ? '13px' : '11px'

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #FFFFFF;
        ${bgClass}
      ">
        <span style="
          transform: rotate(45deg);
          color: #FFFFFF;
          font-weight: 800;
          font-family: inherit;
          font-size: ${fontSize};
          line-height: 1;
        ">${index + 1}</span>
      </div>
      <div style="
        width: 8px;
        height: 3px;
        background: rgba(15, 23, 42, 0.2);
        border-radius: 50%;
        margin-top: 3px;
        filter: blur(1px);
      "></div>
    </div>
  `

  return L.divIcon({
    className: 'tripin-custom-marker',
    html,
    iconSize: [size, size + 6],
    iconAnchor: [size / 2, size + 4],
    popupAnchor: [0, -(size + 2)],
  })
}

/**
 * DestinationMap Component
 * 
 * Reusable Leaflet map component untuk Tripin Planner & Itinerary.
 * Mendukung sinkronisasi marker <-> card, polyline route, filter hari, dan state mobile responsif.
 */
export function DestinationMap({
  destinations = [],
  selectedDestination = null,
  onDestinationSelect = () => {},
  route = null,
  dayFilter = 'all',
  userLocation = null,
  height = '440px',
  isExpanded = false,
  onToggleExpand = null,
  className = '',
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersLayerRef = useRef(null)
  const polylineLayerRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [internalError, setInternalError] = useState(null)

  // Filter destinasi yang memiliki koordinat valid
  const validDestinations = useMemo(() => {
    return (destinations || []).filter((d) => isValidCoordinate(d?.latitude, d?.longitude))
  }, [destinations])

  // Hitung total jarak straight-line untuk rute aktif
  const routePoints = useMemo(() => {
    const list = route || validDestinations
    return (list || []).filter((d) => isValidCoordinate(d?.latitude, d?.longitude))
  }, [route, validDestinations])

  const routeDistance = useMemo(() => {
    return calculateTotalRouteDistance(routePoints)
  }, [routePoints])

  // Inisialisasi peta Leaflet sekali saat mount
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    try {
      // Temporary world view; valid itinerary coordinates fit the map once loaded.
      const defaultCenter = [0, 0]
      const defaultZoom = 2

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: false, // Custom position nanti
        scrollWheelZoom: true,
      })

      // Layer Tile OpenStreetMap Standard
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 2,
      }).addTo(map)

      // Tambahkan zoom control di kanan atas
      L.control.zoom({ position: 'topright' }).addTo(map)

      // Layer groups untuk markers dan garis rute
      markersLayerRef.current = L.layerGroup().addTo(map)
      polylineLayerRef.current = L.layerGroup().addTo(map)

      mapInstanceRef.current = map
      setMapReady(true)
    } catch (err) {
      console.error('[DestinationMap] Gagal inisialisasi peta:', err)
      setInternalError(err.message || 'Gagal memuat peta.')
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Invalidate size saat tinggi atau status expanded berubah
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize()
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [height, isExpanded])

  // Render Marker dan Polyline setiap kali destinasi atau selectedDestination berubah
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !mapReady) return

    const markersLayer = markersLayerRef.current
    const polylineLayer = polylineLayerRef.current

    if (markersLayer) markersLayer.clearLayers()
    if (polylineLayer) polylineLayer.clearLayers()

    if (validDestinations.length === 0) return

    const bounds = L.latLngBounds()
    const selectedId = typeof selectedDestination === 'object' ? selectedDestination?.id : selectedDestination

    // 1. Gambar Marker untuk setiap destinasi yang valid
    validDestinations.forEach((dest, idx) => {
      const lat = Number(dest.latitude)
      const lon = Number(dest.longitude)
      const isSelected = selectedId != null && String(dest.id) === String(selectedId)

      const icon = createCustomMarkerIcon(idx, isSelected, dest.name)
      const marker = L.marker([lat, lon], {
        icon,
        title: dest.name,
        alt: `Marker ${dest.name}`,
        riseOnHover: true,
      })

      // Popup card interaktif
      const ticketText = dest.ticket_price != null
        ? Number(dest.ticket_price) > 0 ? formatRupiah(Number(dest.ticket_price)) : 'Akses Gratis'
        : 'Informasi Tiket'

      const areaText = dest.area?.areaName || dest.city || 'Area Wisata'

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 170px; max-width: 220px; padding: 2px;">
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="background: #CCFBF1; color: #0F766E; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              Urutan #${idx + 1}
            </span>
            <span style="color: #64748B; font-size: 10px; font-weight: 600;">${areaText}</span>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; line-height: 1.3; margin-bottom: 4px;">
            ${dest.name}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #F1F5F9; padding-top: 6px; margin-top: 6px;">
            <span style="color: #0F766E; font-weight: 800; font-size: 11px;">${ticketText}</span>
            <span style="color: #94A3B8; font-size: 10px;">${dest.distanceKm != null ? `~${dest.distanceKm} km geographic` : ''}</span>
          </div>
        </div>
      `

      marker.bindPopup(popupHtml, {
        offset: [0, isSelected ? -38 : -32],
        className: 'tripin-leaflet-popup',
      })

      marker.on('click', () => {
        onDestinationSelect(dest)
      })

      if (isSelected) {
        // Buka popup jika destinasi ini sedang dipilih
        setTimeout(() => {
          marker.openPopup()
        }, 100)
      }

      markersLayer.addLayer(marker)
      bounds.extend([lat, lon])
    })

    // 2. Gambar Garis Polyline Menghubungkan Rute
    if (routePoints.length >= 2) {
      const latLngs = routePoints.map((p) => [Number(p.latitude), Number(p.longitude)])

      // Garis glow latar belakang
      const bgLine = L.polyline(latLngs, {
        color: '#14B8A6',
        weight: 6,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      })
      polylineLayer.addLayer(bgLine)

      // Garis utama bergaris putus-putus elegan
      const mainLine = L.polyline(latLngs, {
        color: '#0F766E',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '7, 8',
        lineCap: 'round',
        lineJoin: 'round',
      })
      polylineLayer.addLayer(mainLine)
    }

    // 3. Auto fitBounds agar seluruh destinasi terlihat nyaman di viewport
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 14,
        animate: true,
      })
    }
  }, [validDestinations, routePoints, selectedDestination, mapReady, onDestinationSelect])

  // Center pan jika user memilih destinasi tertentu secara eksplisit
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedDestination) return

    const lat = Number(selectedDestination.latitude)
    const lon = Number(selectedDestination.longitude)

    if (isValidCoordinate(lat, lon)) {
      map.panTo([lat, lon], {
        animate: true,
        duration: 0.6,
      })
    }
  }, [selectedDestination])

  // Empty state jika tidak ada koordinat sama sekali
  if (internalError) {
    return (
      <div className={`bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center flex flex-col items-center justify-center space-y-3 ${className}`} style={{ minHeight: height }}>
        <AlertCircle className="w-8 h-8 text-amber-500" />
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-slate-800">Peta Tidak Tersedia</h4>
          <p className="text-xs text-slate-500 max-w-xs">{internalError}</p>
        </div>
      </div>
    )
  }

  const unmappedCount = (destinations || []).length - validDestinations.length

  return (
    <div className={`relative bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-xs flex flex-col group ${className}`}>
      {/* Top Map Header / Controls Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-[#0F766E] animate-spin-slow" />
          <span className="text-[11px] font-extrabold text-slate-800 tracking-tight">
            {dayFilter === 'all' ? 'Seluruh Destinasi' : `Rute Hari ${dayFilter}`}
          </span>
          <span className="text-[10px] bg-teal-50 text-[#0F766E] font-bold px-2 py-0.5 rounded-full border border-teal-100">
            {validDestinations.length} Lokasi
          </span>
        </div>

        {routeDistance.totalDistanceKm > 0 && (
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-slate-100 hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
            <Navigation className="w-3 h-3 text-[#0F766E]" />
            <span>Jarak geografis ~{routeDistance.totalDistanceKm} km</span>
          </div>
        )}
      </div>

      {/* Expand / Minimize Toggle (jika callback disediakan) */}
      {onToggleExpand && (
        <button
          type="button"
          onClick={onToggleExpand}
          className="absolute top-3 right-14 z-[1000] bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-sm border border-slate-100 text-slate-700 hover:text-[#0F766E] transition-all cursor-pointer"
          title={isExpanded ? 'Kecilkan Peta' : 'Perbesar Peta'}
          aria-label={isExpanded ? 'Kecilkan Peta' : 'Perbesar Peta'}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full relative z-0 transition-all duration-300"
        style={{ height, minHeight: '260px' }}
      />

      {/* Bottom Disclaimer Banner */}
      <div className="absolute bottom-2.5 left-3 right-3 z-[1000] pointer-events-none flex flex-col sm:flex-row items-center justify-between gap-1.5">
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-white text-[10px] font-medium shadow-xs flex items-center gap-1.5">
          <Info className="w-3 h-3 text-teal-400 shrink-0" />
          <span>Rute estimasi berdasarkan posisi geografis garis lurus</span>
        </div>

        {unmappedCount > 0 && (
          <div className="bg-amber-500/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-[10px] font-semibold shadow-xs">
            {unmappedCount} destinasi tanpa koordinat
          </div>
        )}
      </div>
    </div>
  )
}

export default DestinationMap
