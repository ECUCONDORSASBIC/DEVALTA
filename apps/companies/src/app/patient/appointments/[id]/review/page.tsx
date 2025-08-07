'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, ArrowLeft, CheckCircle, User, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentReviewPage() {
  const params = useParams();
  const router = useRouter();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const appointment = {
    id: 'apt1',
    companyId: '1',
    companyName: 'Hospital Universitario',
    doctorName: 'Dr. García',
    specialty: 'Cardiología',
    date: '2024-01-15',
    time: '09:00',
    location: 'Consulta 3A, Planta 2'
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <div data-testid="review-success" className="space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Reseña Enviada!
                </h2>
                <p data-testid="thank-you-message" className="text-gray-600">
                  Gracias por tu reseña. Tu opinión nos ayuda a mejorar nuestros servicios.
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm space-y-1">
                  <div><strong>Calificación:</strong> {rating} estrellas</div>
                  <div><strong>Institución:</strong> {appointment.companyName}</div>
                  <div><strong>Médico:</strong> {appointment.doctorName}</div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Link
                  href="/patient/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ir al Dashboard
                </Link>
                
                <Link
                  href={`/companies/${appointment.companyId}/reviews`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Ver Todas las Reseñas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/patient/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Evaluar Consulta Médica</h1>
          <p className="text-gray-600">Comparte tu experiencia para ayudar a otros pacientes</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Appointment Info */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Consulta</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{appointment.companyName}</p>
                  <p className="text-sm text-gray-600">{appointment.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{appointment.doctorName}</p>
                  <p className="text-sm text-gray-600">{appointment.specialty}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(appointment.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{appointment.time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Tu Evaluación</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Calificación general *
                </label>
                <div data-testid="rating-stars" className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      data-star={star}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {rating === 0 && 'Selecciona una calificación'}
                  {rating === 1 && 'Muy malo'}
                  {rating === 2 && 'Malo'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bueno'}
                  {rating === 5 && 'Excelente'}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuéntanos tu experiencia
                </label>
                <textarea
                  data-testid="review-comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comparte detalles sobre la atención recibida, el trato del personal, las instalaciones, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Recommendation */}
              <div>
                <div className="flex items-center">
                  <input
                    id="recommend"
                    type="checkbox"
                    data-testid="recommend-company"
                    checked={wouldRecommend}
                    onChange={(e) => setWouldRecommend(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recommend" className="ml-3 text-sm font-medium text-gray-700">
                    Recomendaría esta institución a otros pacientes
                  </label>
                </div>
              </div>

              {/* Category Ratings */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Califica aspectos específicos (opcional)
                </h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Atención médica', key: 'medical' },
                    { label: 'Tiempo de espera', key: 'waiting' },
                    { label: 'Instalaciones', key: 'facilities' },
                    { label: 'Personal de apoyo', key: 'staff' }
                  ].map((category) => (
                    <div key={category.key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{category.label}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={`${category.key}-${star}`}
                            type="button"
                            className="focus:outline-none"
                          >
                            <Star className="h-4 w-4 text-gray-300 hover:text-yellow-400 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                data-testid="submit-review"
                disabled={rating === 0 || loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block"></div>
                    Enviando reseña...
                  </>
                ) : (
                  'Enviar Reseña'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Tu reseña será publicada de forma anónima y ayudará a otros pacientes a tomar mejores decisiones.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}