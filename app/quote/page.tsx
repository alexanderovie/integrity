'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface QuoteFormData {
  // Availability
  preferredDate: string;

  // Service Type
  serviceType: string;

  // Frequency
  frequency: string;

  // Property Details
  bedrooms: string;
  bathrooms: string;
  propertySize: string;

  // Extras
  extras: string[];

  // Date and Time
  serviceDate: string;
  timeSlot: string;

  // Tips
  tipPercentage: string;
  customTip: string;

  // Contact Information
  name: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;

  // Comments
  comments: string;
}

function QuotePageContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<QuoteFormData>({
    // Availability
    preferredDate: '',

    // Service Type
    serviceType: 'Standard Clean',

    // Frequency
    frequency: 'bi-weekly',

    // Property Details
    bedrooms: '1',
    bathrooms: '1',
    propertySize: '750',

    // Extras
    extras: [],

    // Date and Time
    serviceDate: '',
    timeSlot: '',

    // Tips
    tipPercentage: '15',
    customTip: '',

    // Contact Information
    name: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',

    // Comments
    comments: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Cargar datos del Hero si existen
  useEffect(() => {
    const heroData = {
      name: searchParams.get('name') || '',
      email: searchParams.get('email') || '',
      phone: searchParams.get('phone') || '',
      serviceType: searchParams.get('services')?.split(',')[0] || '' // Tomar el primer servicio
    };

    if (heroData.name || heroData.email || heroData.phone || heroData.serviceType) {
      setFormData(prev => ({
        ...prev,
        ...heroData
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let firstErrorField = '';

    // Required fields validation (in order of appearance)
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
      if (!firstErrorField) {
        firstErrorField = 'zipCode';
      }
    }
    if (!formData.serviceType.trim()) {
      newErrors.serviceType = 'Service type is required';
      if (!firstErrorField) {
        firstErrorField = 'serviceType';
      }
    }
    if (!formData.bedrooms.trim()) {
      newErrors.bedrooms = 'Number of bedrooms is required';
      if (!firstErrorField) {
        firstErrorField = 'bedrooms';
      }
    }
    if (!formData.bathrooms.trim()) {
      newErrors.bathrooms = 'Number of bathrooms is required';
      if (!firstErrorField) {
        firstErrorField = 'bathrooms';
      }
    }
    if (!formData.propertySize.trim()) {
      newErrors.propertySize = 'Property size is required';
      if (!firstErrorField) {
        firstErrorField = 'propertySize';
      }
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      if (!firstErrorField) {
        firstErrorField = 'name';
      }
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      if (!firstErrorField) {
        firstErrorField = 'email';
      }
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
      if (!firstErrorField) {
        firstErrorField = 'phone';
      }
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      if (!firstErrorField) {
        firstErrorField = 'address';
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      if (!firstErrorField) {
        firstErrorField = 'email';
      }
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
      if (!firstErrorField) {
        firstErrorField = 'phone';
      }
    }

    // ZIP code validation
    const zipRegex = /^\d{5}$/;
    if (formData.zipCode && !zipRegex.test(formData.zipCode)) {
      newErrors.zipCode = 'Enter a valid 5-digit ZIP code';
      if (!firstErrorField) {
        firstErrorField = 'zipCode';
      }
    }

    setErrors(newErrors);

    // Auto-scroll to first error field
    if (firstErrorField && Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          element.focus();
        }
      }, 100);
    }

    return Object.keys(newErrors).length === 0;
  };

  const getServiceId = (serviceName: string): string => {
    const serviceMap: { [key: string]: string } = {
      "Standard Clean": "regular-cleaning",
      "Deep Cleaning": "deep-cleaning",
      "Move-in Clean": "move-in-out",
      "Move-out Clean": "move-in-out",
      "Post-Construction": "post-construction",
      "One-Time Clean": "regular-cleaning"
    };
    return serviceMap[serviceName] || "regular-cleaning";
  };

  // Calcular precio basado en los datos del formulario
  const calculatePrice = (): number => {
    let basePrice = 0;
    const propertySize = parseInt(formData.propertySize) || 0;
    const bedrooms = parseInt(formData.bedrooms) || 0;
    const bathrooms = parseInt(formData.bathrooms) || 0;

    // Precios por servicio
    const servicePrices: { [key: string]: number } = {
      "Standard Clean": 0.12,
      "Deep Cleaning": 0.20,
      "Move-in Clean": 0.18,
      "Move-out Clean": 0.18,
      "Post-Construction": 0.25,
      "One-Time Clean": 0.15
    };

    // Calcular precio base por servicio
    const rate = servicePrices[formData.serviceType] || 0.12;
    basePrice = propertySize * rate;

    // Ajustes por habitaciones y baños
    const roomAdjustment = (bedrooms * 8) + (bathrooms * 12);
    basePrice += roomAdjustment;

    // Ajuste por frecuencia (solo para Standard Clean)
    if (formData.serviceType === "Standard Clean" && formData.frequency) {
      const frequencyMultiplier = {
        "weekly": 0.9,
        "bi-weekly": 1.0,
        "monthly": 1.1
      };
      const multiplier = frequencyMultiplier[formData.frequency as keyof typeof frequencyMultiplier] || 1.0;
      basePrice *= multiplier;
    }

    // Extras
    const extrasPrices: { [key: string]: number } = {
      "interior_windows": 25,
      "blinds_cleaning": 30,
      "dishes": 15,
      "inside_oven": 35,
      "inside_fridge": 30,
      "pet_hair_removal": 20,
      "heavy_duty": 50,
      "garage_cleaning": 40
    };

    let extrasTotal = 0;
    formData.extras.forEach(extra => {
      extrasTotal += extrasPrices[extra] || 0;
    });

    // Aplicar propina si está seleccionada
    let tipPercentage = 0;
    if (formData.tipPercentage === 'other' && formData.customTip) {
      tipPercentage = parseInt(formData.customTip) || 0;
    } else if (formData.tipPercentage && formData.tipPercentage !== 'other') {
      tipPercentage = parseInt(formData.tipPercentage) || 0;
    }
    const tipAmount = (basePrice + extrasTotal) * (tipPercentage / 100);

    // Aplicar impuestos de Florida (6% + 1% local = 7%)
    const taxRate = 0.07;
    const subtotal = basePrice + extrasTotal + tipAmount;
    const tax = subtotal * taxRate;
    const totalPrice = Math.round(subtotal + tax);

    // Precio mínimo
    return Math.max(totalPrice, 75);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const calculatedPrice = calculatePrice();

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: getServiceId(formData.serviceType),
          customerEmail: formData.email,
          customerName: formData.name,
          customPrice: calculatedPrice,
          quoteData: {
            serviceType: formData.serviceType,
            frequency: formData.frequency,
            propertySize: formData.propertySize,
            bedrooms: formData.bedrooms,
            bathrooms: formData.bathrooms,
            serviceDate: formData.serviceDate,
            timeSlot: formData.timeSlot,
            tipPercentage: formData.tipPercentage,
            address: formData.address,
            zipCode: formData.zipCode,
            extras: formData.extras,
            comments: formData.comments,
            calculatedPrice: calculatedPrice
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const { sessionId } = await response.json();

      const sessionResponse = await fetch(`/api/checkout-session/${sessionId}`);

      if (!sessionResponse.ok) {
        throw new Error('Error getting checkout session URL');
      }

      const { url } = await sessionResponse.json();

      window.location.href = url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error:', error);
      // Usar un estado de error en lugar de alert para mejor UX
      setErrors({ submit: `Error processing payment: ${errorMessage}. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  const calculatedPrice = calculatePrice();

  return (
    <div className="min-h-screen bg-white dark:bg-dark-gray py-6 px-2 sm:px-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white dark:bg-secondary shadow-xl rounded-md p-4 sm:p-6 lg:p-10">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-secondary dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-secondary dark:text-white">
              Book Now
            </h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Availability Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">
                    Availability
                  </h3>
                  <div>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="input-field w-full"
                      placeholder="ZIP Code *"
                      maxLength={5}
                      style={{ fontSize: '16px' }}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>

                {/* Service Type Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">
                    Service Type *
                  </h3>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="input-field w-full h-12"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="">Select service</option>
                    <option value="Standard Clean">Standard Clean</option>
                    <option value="Deep Cleaning">Deep Cleaning</option>
                    <option value="Move-in Clean">Move-in Clean</option>
                    <option value="Move-out Clean">Move-out Clean</option>
                    <option value="Post-Construction">Post-Construction</option>
                    <option value="One-Time Clean">One-Time Clean</option>
                  </select>
                  {errors.serviceType && <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>}
                </div>

                {/* Frequency Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">
                    Frequency
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { value: "weekly", label: "Every Week" },
                      { value: "bi-weekly", label: "Every 2 Weeks" },
                      { value: "monthly", label: "Every Month" },
                      { value: "one-time", label: "One Time" }
                    ].map(freq => (
                      <button
                        key={freq.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, frequency: freq.value }))}
                        className={`py-2 px-4 rounded-sm border transition-colors ${formData.frequency === freq.value
                          ? 'bg-promobar text-white border-promobar'
                          : 'bg-white dark:bg-gray-700 text-secondary dark:text-white border-gray-300 dark:border-gray-600 hover:border-promobar'
                          }`}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Details Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">
                    Property Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
                        Bedrooms *
                      </label>
                      <select
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        className="input-field w-full h-12"
                        style={{ fontSize: '16px' }}
                      >
                        <option value="">Select</option>
                        <option value="1">1 Bedroom</option>
                        <option value="2">2 Bedrooms</option>
                        <option value="3">3 Bedrooms</option>
                        <option value="4">4 Bedrooms</option>
                        <option value="5+">5+ Bedrooms</option>
                      </select>
                      {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
                        Bathrooms *
                      </label>
                      <select
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        className="input-field w-full h-12"
                        style={{ fontSize: '16px' }}
                      >
                        <option value="">Select</option>
                        <option value="1">1 Bathroom</option>
                        <option value="1.5">1.5 Bathrooms</option>
                        <option value="2">2 Bathrooms</option>
                        <option value="2.5">2.5 Bathrooms</option>
                        <option value="3">3 Bathrooms</option>
                        <option value="3.5">3.5 Bathrooms</option>
                        <option value="4">4 Bathrooms</option>
                        <option value="4.5">4.5 Bathrooms</option>
                        <option value="5">5 Bathrooms</option>
                        <option value="5.5">5.5 Bathrooms</option>
                        <option value="6+">6+ Bathrooms</option>
                      </select>
                      {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
                        Sq Ft *
                      </label>
                      <select
                        name="propertySize"
                        value={formData.propertySize}
                        onChange={handleChange}
                        className="input-field w-full h-12"
                        style={{ fontSize: '16px' }}
                      >
                        <option value="">Select</option>
                        <option value="750">1 - 999 Sq Ft</option>
                        <option value="1250">1000 - 1499 Sq Ft</option>
                        <option value="1750">1500 - 1999 Sq Ft</option>
                        <option value="2250">2000 - 2499 Sq Ft</option>
                        <option value="2750">2500 - 2999 Sq Ft</option>
                        <option value="3250">3000 - 3499 Sq Ft</option>
                        <option value="3750">3500 - 3999 Sq Ft</option>
                        <option value="4250">4000 - 4499 Sq Ft</option>
                        <option value="4750">4500 - 4999 Sq Ft</option>
                        <option value="5250">5000+ Sq Ft</option>
                      </select>
                      {errors.propertySize && <p className="text-red-500 text-sm mt-1">{errors.propertySize}</p>}
                    </div>
                  </div>
                </div>

                {/* Extras Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">
                    Extras
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: "interior_windows", label: "Interior Windows", price: 25, icon: "🪟" },
                      { key: "blinds_cleaning", label: "Blinds Cleaning", price: 30, icon: "🏠" },
                      { key: "dishes", label: "Dishes", price: 15, icon: "🍽️" },
                      { key: "inside_oven", label: "Inside Oven", price: 35, icon: "🔥" },
                      { key: "inside_fridge", label: "Inside Fridge", price: 30, icon: "❄️" },
                      { key: "pet_hair_removal", label: "Pet Hair Removal", price: 20, icon: "🐕" },
                      { key: "heavy_duty", label: "Heavy Duty Clean", price: 50, icon: "💪" },
                      { key: "garage_cleaning", label: "Garage Cleaning", price: 40, icon: "🚗" }
                    ].map(extra => (
                      <div
                        key={extra.key}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.extras.includes(extra.key)
                          ? 'border-promobar bg-promobar/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-promobar'
                          }`}
                        onClick={() => {
                          const isSelected = formData.extras.includes(extra.key);
                          setFormData(prev => ({
                            ...prev,
                            extras: isSelected
                              ? prev.extras.filter(e => e !== extra.key)
                              : [...prev.extras, extra.key]
                          }));
                        }}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{extra.icon}</div>
                          <div className="text-sm font-medium text-secondary dark:text-white">
                            {extra.label}
                          </div>
                          <div className="text-promobar font-semibold">
                            +${extra.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Date and Time Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">
                    Service Date and Time
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        className="input-field w-full h-12"
                        min={new Date().toISOString().split('T')[0]}
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
                        Service Date
                      </label>
                      <input
                        type="date"
                        name="serviceDate"
                        value={formData.serviceDate}
                        onChange={handleChange}
                        className="input-field w-full h-12"
                        min={new Date().toISOString().split('T')[0]}
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary dark:text-white mb-2">
                        Time Slot
                      </label>
                      <select
                        name="timeSlot"
                        value={formData.timeSlot}
                        onChange={handleChange}
                        className="input-field w-full h-12"
                        style={{ fontSize: '16px' }}
                      >
                        <option value="">Select time</option>
                        <option value="morning">Morning (8AM-12PM)</option>
                        <option value="afternoon">Afternoon (12PM-5PM)</option>
                        <option value="evening">Evening (5PM-8PM)</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">
                    Tips (Optional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                    {["0", "10", "15", "20", "other"].map(tip => (
                      <button
                        key={tip}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tipPercentage: tip }))}
                        className={`py-2 px-4 rounded-sm border transition-colors ${formData.tipPercentage === tip
                          ? 'bg-promobar text-white border-promobar'
                          : 'bg-white dark:bg-gray-700 text-secondary dark:text-white border-gray-300 dark:border-gray-600 hover:border-promobar hover:bg-promobar/10 dark:hover:bg-promobar/20'
                          }`}
                      >
                        {tip === "other" ? "Other" : `${tip}%`}
                      </button>
                    ))}
                  </div>
                  {formData.tipPercentage === "other" && (
                    <div>
                      <input
                        type="number"
                        name="customTip"
                        placeholder="Enter custom tip percentage"
                        className="input-field w-full"
                        min="0"
                        max="100"
                        style={{ fontSize: '16px' }}
                        onChange={(e) => setFormData(prev => ({ ...prev, customTip: e.target.value }))}
                      />
                    </div>
                  )}
                </div>

                {/* Contact Information Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field w-full"
                        placeholder="Full name *"
                        style={{ fontSize: '16px' }}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field w-full"
                        placeholder="Email address *"
                        style={{ fontSize: '16px' }}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field w-full"
                        placeholder="Phone number *"
                        style={{ fontSize: '16px' }}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="input-field w-full"
                        placeholder="Full address *"
                        style={{ fontSize: '16px' }}
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">
                    Comments
                  </h3>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    className="input-field w-full resize-none"
                    rows={4}
                    placeholder="Special items or instructions..."
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-secondary p-6 rounded-lg sticky top-8 border border-promobar/20 shadow-lg">
                  <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">
                    Booking Summary
                  </h3>

                  <div className="space-y-3 mb-6">
                    {formData.serviceType && (
                      <div className="flex justify-between">
                        <span className="text-secondary dark:text-white">Service:</span>
                        <span className="text-secondary dark:text-white font-medium">{formData.serviceType}</span>
                      </div>
                    )}
                    {formData.frequency && (
                      <div className="flex justify-between">
                        <span className="text-secondary dark:text-white">Frequency:</span>
                        <span className="text-secondary dark:text-white font-medium">{formData.frequency}</span>
                      </div>
                    )}
                    {formData.bedrooms && formData.bathrooms && (
                      <div className="flex justify-between">
                        <span className="text-secondary dark:text-white">Property:</span>
                        <span className="text-secondary dark:text-white font-medium">
                          {formData.bedrooms} bed, {formData.bathrooms} bath
                        </span>
                      </div>
                    )}
                    {formData.propertySize && (
                      <div className="flex justify-between">
                        <span className="text-secondary dark:text-white">Size:</span>
                        <span className="text-secondary dark:text-white font-medium">{formData.propertySize} sq ft</span>
                      </div>
                    )}
                    {formData.extras.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-secondary dark:text-white">Extras:</span>
                        <span className="text-secondary dark:text-white font-medium">{formData.extras.length} selected</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-secondary dark:text-white">Total:</span>
                      <span className="text-2xl font-bold text-promobar">
                        ${calculatedPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
                      *Price includes taxes and selected tip
                    </p>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full btn-secondary py-4 rounded-sm font-bold text-lg transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                        }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        'Book Now'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Mobile Floating Price Summary */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-secondary border-t border-gray-200 dark:border-gray-700 p-4 z-50 shadow-xl">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
              <p className="text-2xl font-bold text-promobar mb-2">
                ${calculatedPrice.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                *Price includes taxes and selected tip
              </p>
            </div>
          </div>

          {/* Add padding bottom for mobile to avoid overlap with floating button */}
          <div className="lg:hidden h-24"></div>
        </div>
      </div>
    </div>
  );
}

export default function QuotePage(): React.ReactElement {
  return (
    <Suspense fallback={<div>Loading quote...</div>}>
      <QuotePageContent />
    </Suspense>
  );
}
