import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, ArrowRight, ShieldCheck, Heart, Users, Calendar, 
  FlaskConical, Pill, Receipt, CheckCircle, BarChart3, Images, ZoomIn, X 
} from 'lucide-react';
import heroImage from '../assets/hospital_hero.png';
import { getHospitalImages } from '../services/hospitalService';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLightbox, setActiveLightbox] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await getHospitalImages();
        setImages(res.data || []);
      } catch (err) {
        console.error('Failed to fetch hospital images', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : '';
  };

  const handlePortalRedirect = () => {
    if (user) {
      navigate('/dashboard/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-brand-500/20 selection:text-brand-850">
      {/* ── Navbar ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold tracking-tight text-slate-900 font-outfit">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/15">
              <Activity className="h-5 w-5" />
            </div>
            <span>Medi<span className="text-brand-600">Flow</span></span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-650">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#analytics" className="hover:text-slate-900 transition-colors">Analytics</a>
            <a href="#workflow" className="hover:text-slate-900 transition-colors">Clinical Workflow</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={handlePortalRedirect}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 px-4.5 py-2 text-sm font-semibold transition shadow-sm"
            >
              Access Portal <ArrowRight className="ml-1.5 h-4 w-4 text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        <div className="absolute top-[-30%] left-[-10%] h-[700px] w-[700px] rounded-full bg-brand-500/5 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[700px] w-[700px] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-xs font-semibold text-brand-700 shadow-sm animate-pulse-slow">
              <ShieldCheck className="h-3.5 w-3.5" /> Multi-Role Enterprise SaaS
            </div>
            
            <h1 className="font-outfit text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Empowering Modern Healthcare Delivery
            </h1>
            
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed font-medium">
              MediFlow connects clinical, administrative, pharmacy, laboratory, and billing modules into a single, unified enterprise SaaS product. Designed for premium speed, accessibility, and high performance.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePortalRedirect}
                className="inline-flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-6 py-3.5 text-sm font-bold shadow-md shadow-brand-600/10 transition-button"
              >
                Access Portal Terminal <ArrowRight className="ml-2 h-4.5 w-4.5" />
              </button>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3.5 text-sm font-bold shadow-sm transition"
              >
                Register Patient Account
              </Link>
            </div>
          </div>

          <div className="flex justify-center items-center relative lg:pl-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/5 to-emerald-600/5 rounded-3xl blur-2xl opacity-60" />
            <img 
              src={heroImage} 
              alt="MediFlow Professional Health Care Illustration" 
              className="relative max-h-[460px] w-auto object-contain rounded-3xl shadow-lg border border-slate-150 animate-fade-in hover:scale-[1.01] transition-transform duration-500 bg-white"
            />
          </div>
        </div>
      </section>

      {/* ── Quick Stats ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="font-outfit text-3xl sm:text-4xl font-extrabold text-slate-900">99.9%</div>
            <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">System SLA Uptime</div>
          </div>
          <div>
            <div className="font-outfit text-3xl sm:text-4xl font-extrabold text-brand-600">50+</div>
            <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">Clinicians Connected</div>
          </div>
          <div>
            <div className="font-outfit text-3xl sm:text-4xl font-extrabold text-slate-900">12k+</div>
            <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">EMR Clinical Records</div>
          </div>
          <div>
            <div className="font-outfit text-3xl sm:text-4xl font-extrabold text-emerald-600">Inst.</div>
            <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">Razorpay Invoicing</div>
          </div>
        </div>
      </section>

      {/* ── Features List ───────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="font-outfit text-3xl font-extrabold text-slate-900">Comprehensive Clinical Suite</h2>
            <p className="text-slate-500 text-sm sm:text-base font-semibold leading-relaxed">
              MediFlow integrates specialized features for doctors, nurses, receptionists, pharmacists, lab technicians, and hospital administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* EMR */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="h-10 w-10 flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl mb-4">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Electronic Health Records</h3>
              <p className="text-slate-555 text-xs sm:text-sm font-semibold leading-relaxed">
                Full-featured patient timeline showing medical logs, SOAP notes, active diagnoses, allergies, and vitals history.
              </p>
            </div>

            {/* Diagnostics */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="h-10 w-10 flex items-center justify-center bg-sky-50 border border-sky-100 text-sky-600 rounded-xl mb-4">
                <FlaskConical className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Laboratory Diagnostics</h3>
              <p className="text-slate-555 text-xs sm:text-sm font-semibold leading-relaxed">
                Track lab test orders from booking to result upload. Automate PDF reporting and results distribution.
              </p>
            </div>

            {/* Pharmacy */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="h-10 w-10 flex items-center justify-center bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl mb-4">
                <Pill className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Pharmacy Inventory</h3>
              <p className="text-slate-555 text-xs sm:text-sm font-semibold leading-relaxed">
                Medicine inventory control with automatic low-stock triggers, pharmaceutical categories, and direct script dispensing.
              </p>
            </div>

            {/* Invoicing */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="h-10 w-10 flex items-center justify-center bg-brand-50 border border-brand-100 text-brand-600 rounded-xl mb-4">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Billing & Razorpay</h3>
              <p className="text-slate-555 text-xs sm:text-sm font-semibold leading-relaxed">
                Generate itemized invoices with discounts, tax rates, print PDF receipts, and process instant online payments.
              </p>
            </div>
          </div>

          {/* Hospital Gallery / Facilities Section */}
          {!isLoading && images.length > 0 && (
            <div className="pt-16 border-t border-slate-200 space-y-10">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-xs font-semibold text-brand-700">
                  <Images className="h-3.5 w-3.5" /> Our Facilities
                </div>
                <h2 className="font-outfit text-3xl font-extrabold text-slate-900">Explore Our Hospital</h2>
                <p className="text-slate-500 text-sm sm:text-base font-semibold leading-relaxed">
                  Take a visual tour of our modern state-of-the-art medical equipment, clinical wards, and healthcare facilities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((img) => (
                  <div 
                    key={img._id} 
                    className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 cursor-pointer"
                    onClick={() => setActiveLightbox(img)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <img 
                        src={`${getBaseUrl()}${img.url}`} 
                        alt={img.caption || 'Hospital facility'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="flex items-center gap-1 bg-white/95 backdrop-blur text-slate-900 px-3 py-2 rounded-xl text-xs font-bold shadow-lg">
                          <ZoomIn className="w-3.5 h-3.5" /> View Photo
                        </span>
                      </div>
                    </div>
                    {img.caption && (
                      <div className="p-4 border-t border-slate-100 bg-white">
                        <p className="text-sm font-bold text-slate-900 truncate">{img.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Analytics Section ────────────────────────────────────────────────── */}
      <section id="analytics" className="py-20 px-6 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-700">
              <BarChart3 className="h-3.5 w-3.5" /> Operations Intelligence
            </div>
            <h2 className="font-outfit text-3xl font-extrabold text-slate-900">
              Real-time Administrative Analytics
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-semibold">
              Supercharge hospital operations with instant data aggregation. MediFlow dashboards automatically compute revenue trends, patient metrics, pharmacy stock alerts, and diagnostic lab queues.
            </p>
            <ul className="space-y-3 font-medium text-slate-650 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                Revenue Breakdown Reports with filter options
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                Patient demographic breakdown (Blood group / gender distribution charts)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                Appointment queue metrics with auto-updated charts
              </li>
            </ul>
          </div>
          
          {/* Visual CSS-based analytics card simulation */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-950 font-outfit text-sm">System Revenue Overview</span>
              <span className="px-2 py-0.5 bg-emerald-55 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-100">+24.5%</span>
            </div>
            <div className="h-44 flex items-end justify-between gap-2.5 pt-4">
              <div className="w-full bg-slate-200 rounded-t-lg h-[40%] hover:bg-brand-500 transition-colors duration-300" title="Month 1" />
              <div className="w-full bg-slate-200 rounded-t-lg h-[55%] hover:bg-brand-500 transition-colors duration-300" title="Month 2" />
              <div className="w-full bg-slate-200 rounded-t-lg h-[50%] hover:bg-brand-500 transition-colors duration-300" title="Month 3" />
              <div className="w-full bg-slate-200 rounded-t-lg h-[75%] hover:bg-brand-500 transition-colors duration-300" title="Month 4" />
              <div className="w-full bg-slate-200 rounded-t-lg h-[65%] hover:bg-brand-500 transition-colors duration-300" title="Month 5" />
              <div className="w-full bg-brand-600 rounded-t-lg h-[95%] hover:bg-brand-500 transition-colors duration-300" title="Month 6 (Current)" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Clinical Workflow Section ───────────────────────────────────────── */}
      <section id="workflow" className="py-20 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-semibold text-emerald-700">
              <Users className="h-3.5 w-3.5" /> Care Orchestration
            </div>
            <h2 className="font-outfit text-3xl font-extrabold text-slate-900">Seamless Clinic-to-Patient Workflow</h2>
            <p className="text-slate-500 text-sm sm:text-base font-semibold leading-relaxed">
              MediFlow connects administrative workflows and medical steps into an automated timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl relative shadow-sm">
              <div className="absolute top-4 right-4 text-xs font-black font-mono text-slate-200">01</div>
              <div className="h-8 w-8 flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-lg mb-4 font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Check-in</h3>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed">
                Receptionist registers patients and schedules doctor slot appointments.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl relative shadow-sm">
              <div className="absolute top-4 right-4 text-xs font-black font-mono text-slate-200">02</div>
              <div className="h-8 w-8 flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-lg mb-4 font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Consultation</h3>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed">
                Doctor reviews history, records SOAP logs, and issues scripts.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl relative shadow-sm">
              <div className="absolute top-4 right-4 text-xs font-black font-mono text-slate-200">03</div>
              <div className="h-8 w-8 flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-lg mb-4 font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Diagnostics</h3>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed">
                Lab techs conduct tests, update results, and generate report PDFs.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl relative shadow-sm">
              <div className="absolute top-4 right-4 text-xs font-black font-mono text-slate-200">04</div>
              <div className="h-8 w-8 flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-lg mb-4 font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Billing & Meds</h3>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed">
                Pharmacist dispenses meds while billing handles invoice payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-slate-500 font-semibold">
          <div className="flex items-center space-x-2 text-slate-700">
            <Activity className="h-4.5 w-4.5 text-brand-600" />
            <span className="font-bold">MediFlow SaaS</span>
          </div>
          <p>© 2026 MediFlow Healthcare Network. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#features" className="hover:text-slate-900 transition">Terms</a>
            <a href="#features" className="hover:text-slate-900 transition">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setActiveLightbox(null)}
        >
          <div 
            className="relative max-w-4xl w-full mx-4 rounded-2xl overflow-hidden shadow-2xl bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={`${getBaseUrl()}${activeLightbox.url}`} 
              alt={activeLightbox.caption || 'Hospital Facility'} 
              className="w-full max-h-[85vh] object-contain mx-auto"
            />
            {activeLightbox.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-6 py-5">
                <p className="text-white text-lg font-semibold">{activeLightbox.caption}</p>
              </div>
            )}
            <button 
              onClick={() => setActiveLightbox(null)}
              className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 text-white rounded-full p-2.5 transition-colors border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
