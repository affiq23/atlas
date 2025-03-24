'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type MapProps = {
  center?: [number, number] // [latitude, longitude]
  zoom?: number
  markers?: Array<{
    id: string
    coordinates: [number, number] // [latitude, longitude]
    title?: string
  }>
  onMarkerClick?: (markerId: string) => void
  onCitySelect?: (city: { name: string, coordinates: [number, number] }) => void
  className?: string
}

const defaultCenter: [number, number] = [20, 0] // [lat, lng]
const defaultZoom = 2

// Create custom marker icon
const createCustomIcon = (isTemporary: boolean = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="w-6 h-6 bg-[#0EA5E9] rounded-full border-2 border-white shadow-lg transform-gpu transition-transform duration-200 hover:scale-125 ${isTemporary ? 'animate-pulse' : ''}">
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#0EA5E9]"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  })
}

export function Map({ 
  center = defaultCenter,
  zoom = defaultZoom,
  markers = [],
  onMarkerClick,
  onCitySelect,
  className = ""
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})
  const tempMarker = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = L.map(mapContainer.current, {
      center: center,
      zoom: zoom,
      minZoom: 2,
      worldCopyJump: true,
      zoomControl: false // We'll add it manually in a better position
    })

    // Add a custom styled tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current)

    // Add zoom control to the top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(map.current)

    // Add scale control
    L.control.scale({
      imperial: false,
      position: 'bottomright'
    }).addTo(map.current)

    // Add click handler for city selection
    if (onCitySelect) {
      map.current.on('click', async (e) => {
        const { lat, lng } = e.latlng
        
        // Remove existing temporary marker
        if (tempMarker.current) {
          tempMarker.current.remove()
        }

        // Add temporary marker at clicked location
        tempMarker.current = L.marker([lat, lng], { 
          icon: createCustomIcon(true)
        }).addTo(map.current!)

        try {
          // Reverse geocode using Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await response.json()
          
          // Get city name from response
          const city = data.address.city || 
                      data.address.town || 
                      data.address.village || 
                      data.address.county ||
                      data.address.state
          
          if (city) {
            // Update marker popup with city name
            tempMarker.current.bindPopup(
              `<div class="p-2">
                <h3 class="font-semibold text-gray-900">${city}</h3>
                <button class="mt-2 text-sm text-[#0EA5E9] hover:underline">Select this city</button>
              </div>`,
              { className: 'custom-popup', closeButton: false }
            ).openPopup()

            // Add click handler to marker
            tempMarker.current.on('click', () => {
              onCitySelect({ 
                name: city, 
                coordinates: [lat, lng]
              })
            })
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error)
        }
      })
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Handle markers
  useEffect(() => {
    if (!map.current) return

    // Remove existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    // Add new markers
    markers.forEach(marker => {
      const customIcon = createCustomIcon()
      
      const markerObj = L.marker(marker.coordinates, { icon: customIcon })
        .addTo(map.current!)
        .bindPopup(
          `<div class="p-2">
            <h3 class="font-semibold text-gray-900">${marker.title || ''}</h3>
            <button class="mt-2 text-sm text-[#0EA5E9] hover:underline">Plan a trip</button>
          </div>`,
          {
            className: 'custom-popup',
            closeButton: false
          }
        )

      // Add hover effect
      markerObj.on('mouseover', () => {
        markerObj.openPopup()
      })

      if (onMarkerClick) {
        markerObj.on('click', () => onMarkerClick(marker.id))
      }

      markersRef.current[marker.id] = markerObj
    })
  }, [markers, onMarkerClick])

  // Update center and zoom when props change
  useEffect(() => {
    if (!map.current) return
    map.current.flyTo(center, zoom, {
      duration: 2,
      easeLinearity: 0.25
    })
  }, [center, zoom])

  return (
    <>
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        .custom-popup .leaflet-popup-tip {
          box-shadow: none;
        }
      `}</style>
      <div ref={mapContainer} className={`relative ${className}`} />
    </>
  )
} 