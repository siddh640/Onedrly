const express = require('express');
const router = express.Router();
const googlePlacesService = require('../services/google-places-service');
const { optionalAuth } = require('../middleware/auth');

/**
 * Medical Tourism Routes
 * Handles medical facilities search and appointment booking
 */

/**
 * GET /api/medical/search/:destination
 * Search for medical facilities in a destination
 */
router.get('/search/:destination', async (req, res) => {
  try {
    const { destination } = req.params;
    const { type } = req.query; // hospital, clinic, pharmacy, dentist, all
    const cache = req.app.locals.cache;
    const cacheKey = `medical_${destination}_${type || 'all'}`;

    console.log(`🏥 Medical search for: ${destination}, type: ${type || 'all'}`);

    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && process.env.ENABLE_CACHE === 'true') {
      console.log('✅ Returning cached medical data');
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // Get destination data with medical facilities
    const destinationData = await googlePlacesService.searchDestination(destination);
    let medicalFacilities = destinationData.medical || [];

    // Filter by type if specified
    if (type && type !== 'all') {
      medicalFacilities = medicalFacilities.filter(facility => {
        const facilityType = (facility.types || []).join(' ').toLowerCase();
        const name = (facility.name || '').toLowerCase();
        return facilityType.includes(type) || name.includes(type);
      });
    }

    // Categorize facilities
    const categorized = {
      hospitals: medicalFacilities.filter(f => 
        (f.types || []).some(t => t.includes('hospital')) || 
        (f.name || '').toLowerCase().includes('hospital')
      ),
      clinics: medicalFacilities.filter(f => 
        (f.types || []).some(t => t.includes('clinic') || t.includes('doctor')) ||
        (f.name || '').toLowerCase().includes('clinic')
      ),
      pharmacies: medicalFacilities.filter(f => 
        (f.types || []).some(t => t.includes('pharmacy')) ||
        (f.name || '').toLowerCase().includes('pharmacy')
      ),
      dentists: medicalFacilities.filter(f => 
        (f.types || []).some(t => t.includes('dentist')) ||
        (f.name || '').toLowerCase().includes('dental')
      )
    };

    const result = {
      destination: destination,
      total: medicalFacilities.length,
      facilities: medicalFacilities,
      categorized: categorized,
      source: destinationData.source || 'unknown'
    };

    // Cache the results
    cache.set(cacheKey, result, 600); // 10 minutes

    res.json({
      success: true,
      data: result,
      cached: false
    });

  } catch (error) {
    console.error('Medical search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching medical facilities',
      error: error.message
    });
  }
});

/**
 * POST /api/medical/book-appointment
 * Book a medical appointment
 */
router.post('/book-appointment', optionalAuth, async (req, res) => {
  try {
    const {
      facilityId,
      facilityName,
      facilityType,
      patientName,
      patientEmail,
      patientPhone,
      appointmentDate,
      appointmentTime,
      reason,
      notes
    } = req.body;

    // Validation
    if (!facilityName || !patientName || !patientEmail || !patientPhone || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: facilityName, patientName, patientEmail, patientPhone, appointmentDate, appointmentTime'
      });
    }

    // Validate date (must be in the future)
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const now = new Date();
    if (appointmentDateTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date and time must be in the future'
      });
    }

    // Generate appointment reference
    const appointmentRef = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // In a real application, you would save this to a database
    // For now, we'll return a confirmation
    const appointment = {
      appointmentId: appointmentRef,
      facilityId: facilityId || 'unknown',
      facilityName: facilityName,
      facilityType: facilityType || 'clinic',
      patientName: patientName,
      patientEmail: patientEmail,
      patientPhone: patientPhone,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      reason: reason || 'General consultation',
      notes: notes || '',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      userId: req.user?._id || null
    };

    // TODO: Save to database (MedicalAppointment model)
    // if (req.user) {
    //   await MedicalAppointment.create(appointment);
    // }

    console.log(`✅ Appointment booked: ${appointmentRef} for ${patientName} at ${facilityName}`);

    res.json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointment: appointment,
        confirmation: {
          reference: appointmentRef,
          message: `Your appointment at ${facilityName} is confirmed for ${appointmentDate} at ${appointmentTime}. A confirmation email has been sent to ${patientEmail}.`,
          nextSteps: [
            'You will receive a confirmation email shortly',
            'Please arrive 15 minutes before your appointment',
            'Bring a valid ID and any relevant medical documents',
            'Contact the facility directly if you need to reschedule'
          ]
        }
      }
    });

  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking appointment',
      error: error.message
    });
  }
});

/**
 * GET /api/medical/appointments
 * Get user's appointments (requires authentication)
 */
router.get('/appointments', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view appointments'
      });
    }

    // TODO: Fetch from database
    // const appointments = await MedicalAppointment.find({ userId: req.user._id }).sort({ appointmentDate: 1 });

    // Mock data for now
    const appointments = [];

    res.json({
      success: true,
      data: {
        appointments: appointments,
        total: appointments.length
      }
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
});

module.exports = router;

