import { useState } from 'react';
import { ArrowRight, Car, Clock3, MapPin, Route } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { getRoadRoute } from '../services/routeService';
import { calculateFareRange, formatRupees } from '../utils/taxiFare';

function FieldLabel({ children }) {
  return <label className="block text-xs font-bold uppercase tracking-widest text-white/45 mb-2">{children}</label>;
}

export default function TaxiFarePage() {
  const [origin, setOrigin] = useState('Panaji, Goa');
  const [destination, setDestination] = useState('Colva Beach, Goa');
  const [route, setRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');

  async function handleRouteSubmit(event) {
    event.preventDefault();
    setLoadingRoute(true);
    setRouteError('');
    try {
      setRoute(await getRoadRoute(origin, destination));
    } catch (error) {
      setRoute(null);
      setRouteError(error.message);
    } finally {
      setLoadingRoute(false);
    }
  }

  const fare = route ? calculateFareRange(route.distanceKm) : null;

  return (
    <div className="min-h-screen bg-navy text-white">
      <Navbar />
      <main className="pt-16 lg:pt-20">
        <section className="px-4 py-12 sm:py-16" style={{ background: 'linear-gradient(135deg,#0a1628 0%,#1a2332 100%)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="max-w-5xl mx-auto text-center">
            <div className="section-tag mb-4">Travel planner</div>
            <h1 className="font-playfair text-4xl sm:text-5xl font-bold mb-4">Goa Taxi Fare Estimator</h1>
            <p className="max-w-2xl mx-auto text-white/60 leading-relaxed">
              Enter any two places in Goa to get the driving road distance and estimated taxi fare range.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
          <div className="grid lg:grid-cols-5 gap-6 items-start">
            <form onSubmit={handleRouteSubmit} className="card-glass p-5 sm:p-7 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.12)', color: '#d4af37' }}>
                  <Route size={18} />
                </div>
                <div>
                  <h2 className="font-playfair text-xl font-bold">Your journey</h2>
                  <p className="text-xs text-white/40">Use a locality, hotel, landmark, station or airport</p>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <FieldLabel>Starting point</FieldLabel>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#d4af37' }} />
                    <input
                      value={origin}
                      onChange={event => setOrigin(event.target.value)}
                      className="taxi-select pl-10"
                      placeholder="e.g. Calangute"
                      aria-label="Starting point"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-center -my-2">
                  <ArrowRight size={18} className="rotate-90 text-white/30" />
                </div>
                <div>
                  <FieldLabel>Destination</FieldLabel>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#d4af37' }} />
                    <input
                      value={destination}
                      onChange={event => setDestination(event.target.value)}
                      className="taxi-select pl-10"
                      placeholder="e.g. Dabolim Airport"
                      aria-label="Destination"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loadingRoute}
                  className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-wait"
                >
                  <Route size={17} /> {loadingRoute ? 'Finding driving route…' : 'Calculate Fare'}
                </button>
                {routeError && (
                  <p className="rounded-xl px-3 py-2 text-sm text-red-200 bg-red-950/35 border border-red-400/20">
                    {routeError}
                  </p>
                )}
              </div>
            </form>

            <div className="lg:col-span-3 space-y-4">
              {route && fare ? (
                <div
                  className="rounded-2xl p-6 sm:p-8"
                  style={{
                    background: 'linear-gradient(135deg,rgba(212,175,55,0.17),rgba(212,175,55,0.05))',
                    border: '1px solid rgba(212,175,55,0.3)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#d4af37' }}>
                        Driving Distance
                      </p>
                      <div className="font-playfair text-4xl sm:text-5xl font-bold">{route.distanceKm} km</div>
                      <p className="text-sm text-white/60 mt-1">{route.origin} to {route.destination}</p>
                      <p className="flex items-center gap-1.5 text-xs text-white/40 mt-2">
                        <Clock3 size={13} /> Approx. {route.durationMinutes} min by car
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37' }}>
                      <Car size={28} />
                    </div>
                  </div>

                  <div className="rounded-xl p-5 bg-navy/80 border border-white/10 mt-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">
                      Estimated Taxi Fare
                    </p>
                    <div className="font-playfair text-3xl sm:text-4xl font-bold my-2" style={{ color: '#d4af37' }}>
                      {formatRupees(fare.min)} – {formatRupees(fare.max)}
                    </div>
                    <p className="text-xs text-white/40 mt-2">
                      Estimated based on {route.distanceKm} km × ₹85 ({formatRupees(fare.base)}) with a range of ±₹100.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="card-glass p-8 sm:p-12 text-center">
                  <Route size={32} className="mx-auto mb-3 text-white/25" />
                  <h2 className="font-playfair text-xl font-bold text-white mb-2">Get an estimated taxi fare</h2>
                  <p className="text-sm text-white/45 max-w-sm mx-auto">
                    Enter your starting point and destination, then calculate the distance and fare range.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
