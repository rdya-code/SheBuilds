// src/data/store.js
// Shared sample data for Module 1 (Create Listing) and Module 2 (Inquiries).
// Data lives in memory only, so it resets on page refresh. Activity 3 allows this.

let listings = [
    {
      id: 1,
      title: 'Handmade Organic Skincare Set',
      category: 'Products',
      price: 35,
      seller: 'Fatima Khan',
      description: 'Set of handmade organic skincare products made in small batches.',
    },
    {
      id: 2,
      title: 'Custom UI/UX Design for Startups',
      category: 'Services',
      price: 150,
      seller: 'Fatima Khan',
      description: 'Custom interface and experience design for early-stage startups.',
    },
  ];
  
  let inquiries = [
    {
      ref: 'INQ-101',
      listingId: 1,
      listingTitle: 'Handmade Organic Skincare Set',
      seller: 'Fatima Khan',
      customer: 'Zara Ahmed',
      message: 'Do you deliver nationwide?',
      status: 'New',
    },
    {
      ref: 'INQ-102',
      listingId: 2,
      listingTitle: 'Custom UI/UX Design for Startups',
      seller: 'Fatima Khan',
      customer: 'Zara Ahmed',
      message: 'Can we discuss a three-page landing site?',
      status: 'In Progress',
    },
    {
      ref: 'INQ-103',
      listingId: 2,
      listingTitle: 'Custom UI/UX Design for Startups',
      seller: 'Fatima Khan',
      customer: 'Zara Ahmed',
      message: 'Thank you for the completed design revisions.',
      status: 'Completed',
    },
  ];
  
  let nextRef = 104;
  const listeners = new Set();
  
  // Notify React components that the data changed.
  const emit = () => listeners.forEach((listener) => listener());
  
  export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  
  export const getListings = () => listings;
  export const getInquiries = () => inquiries;
  
  export function addListing(data) {
    const item = { id: Date.now(), ...data };
    listings = [...listings, item];
    emit();
    return item;
  }
  
  export function addInquiry(data) {
    const ref = `INQ-${nextRef}`;
    nextRef += 1;
    inquiries = [...inquiries, { ref, status: 'New', ...data }];
    emit();
    return ref;
  }
  
  export function updateInquiryStatus(ref, status) {
    inquiries = inquiries.map((q) => (q.ref === ref ? { ...q, status } : q));
    emit();
  }