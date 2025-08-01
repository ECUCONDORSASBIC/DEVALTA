/**
 * 💼 INDIVIDUAL JOB LISTING API
 * 
 * GET /api/v1/job-listings/[id] - Get specific job listing
 * PUT /api/v1/job-listings/[id] - Update job listing  
 * DELETE /api/v1/job-listings/[id] - Close/remove job listing
 */

import { NextRequest, NextResponse } from 'next/server';

// Lazy load Firebase to prevent build errors
async function getDb() {
  try {
    const { getFirestore } = await import('firebase-admin/firestore');
    return getFirestore();
  } catch (error) {
    console.error('Failed to load Firestore:', error);
    return null;
  }
}

// Lazy load auth verification
async function verifyAuth(request: NextRequest) {
  try {
    const { verifyAuthToken } = await import('@/lib/simple-auth');
    return await verifyAuthToken(request);
  } catch (error) {
    console.error('Failed to verify auth:', error);
    return { isValid: false, user: null };
  }
}

/**
 * GET /api/v1/job-listings/[id]
 * Get specific job listing with application stats
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database service unavailable' 
      }, { status: 503 });
    }

    const { id } = params;
    
    const jobRef = db.collection('job_listings').doc(id);
    const jobDoc = await jobRef.get();
    
    if (!jobDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Job listing not found' 
      }, { status: 404 });
    }
    
    const jobData = { id: jobDoc.id, ...jobDoc.data() };
    
    // Get application count
    const applicationsSnapshot = await db.collection('job_applications')
      .where('jobListingId', '==', id)
      .count()
      .get();
      
    return NextResponse.json({
      success: true,
      data: {
        ...jobData,
        applicationCount: applicationsSnapshot.data().count
      }
    });
  } catch (error: any) {
    console.error('Error fetching job listing:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * PUT /api/v1/job-listings/[id]
 * Update job listing (recruiters only)
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database service unavailable' 
      }, { status: 503 });
    }
    
    const { id } = params;
    const updates = await request.json();
    
    // Verify ownership or admin
    const jobRef = db.collection('job_listings').doc(id);
    const jobDoc = await jobRef.get();
    
    if (!jobDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Job listing not found' 
      }, { status: 404 });
    }
    
    const jobData = jobDoc.data();
    if (jobData?.companyId !== authResult.user?.companyId && authResult.user?.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized to update this listing' 
      }, { status: 403 });
    }
    
    // Update listing
    await jobRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    const updatedDoc = await jobRef.get();
    
    return NextResponse.json({
      success: true,
      data: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error: any) {
    console.error('Error updating job listing:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/job-listings/[id]
 * Close/remove job listing (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database service unavailable' 
      }, { status: 503 });
    }
    
    const { id } = params;
    
    // Verify ownership or admin
    const jobRef = db.collection('job_listings').doc(id);
    const jobDoc = await jobRef.get();
    
    if (!jobDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Job listing not found' 
      }, { status: 404 });
    }
    
    const jobData = jobDoc.data();
    if (jobData?.companyId !== authResult.user?.companyId && authResult.user?.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized to delete this listing' 
      }, { status: 403 });
    }
    
    // Soft delete - mark as closed
    await jobRef.update({
      status: 'closed',
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Job listing closed successfully'
    });
  } catch (error: any) {
    console.error('Error deleting job listing:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}