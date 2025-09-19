// Simple mock data to power prototype pages
export const cafeterias = [
  {
    id: 1,
    name: 'Central Food Court',
    building: 'Building A, Level 1',
    hours: '7:00 AM - 9:00 PM',
    lat: 1.2967,
    lng: 103.7764,
    distanceKm: 0.2,
    isOpen: true,
    cuisines: ['Chinese', 'Western'],
    rating: 4.3,
    reviews: 47,
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=800&auto=format&fit=crop'
    ]
  },
  {
    id: 2,
    name: 'North Wing Eatery',
    building: 'Building B, Level 2',
    hours: '8:00 AM - 8:00 PM',
    lat: 1.2985,
    lng: 103.7740,
    distanceKm: 0.5,
    isOpen: true,
    cuisines: ['Indian', 'Malaysian'],
    rating: 4.2,
    reviews: 35,
    hero: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&auto=format&fit=crop',
    photos: []
  },
  {
    id: 3,
    name: 'East Campus Café',
    building: 'Building C, Ground Floor',
    hours: '6:00 AM - 6:00 PM',
    lat: 1.2960,
    lng: 103.7800,
    distanceKm: 0.8,
    isOpen: false,
    cuisines: ['Western', 'Vegetarian'],
    rating: 4.0,
    reviews: 19,
    hero: 'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=1200&auto=format&fit=crop',
    photos: []
  }
]

export const stalls = [
  {
    id: 11,
    cafeteriaId: 1,
    name: 'Noodle Master',
    cuisine: 'Chinese',
    rating: 4.5,
    reviews: 128,
    avgPrice: '$8-12',
    location: 'Stall #12, Near Main Entrance',
    hero: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop',
    menu: [
      { id: 'm1', name: 'Classic Ramen', price: 9.5, image: 'https://images.unsplash.com/photo-1546549039-49e06c4b3c11?w=800&auto=format&fit=crop' },
      { id: 'm2', name: 'Spicy Beef Noodles', price: 10.5, image: 'https://images.unsplash.com/photo-1532634896-26909d0d4b6a?w=800&auto=format&fit=crop' }
    ]
  },
  {
    id: 12,
    cafeteriaId: 1,
    name: 'Burger Junction',
    cuisine: 'Western',
    rating: 4.2,
    reviews: 95,
    avgPrice: '$8-15',
    location: 'Stall #12, Near Main Entrance',
    hero: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop',
    menu: [
      { id: 'm3', name: 'Classic Burger', price: 9.5, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop' },
      { id: 'm4', name: 'Veggie Deluxe', price: 8.5, image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&auto=format&fit=crop', soldOut: true }
    ]
  }
]

export const reviews = [
  {
    id: 901,
    stallId: 12,
    user: { name: 'Alex Chen', avatar: 'https://i.pravatar.cc/48?img=12' },
    date: '2025-01-10',
    rating: 4.5,
    merchant: 'Burger Junction',
    content: 'Amazing ramen! The broth is rich and flavorful. Definitely coming back for more.',
    likes: 23,
    images: []
  },
  {
    id: 902,
    stallId: 12,
    user: { name: 'Li Wei', avatar: 'https://i.pravatar.cc/48?img=32' },
    date: '2025-01-11',
    rating: 4.0,
    merchant: 'Burger Junction',
    content: 'Burger buns were fresh, and the patty juicy. Loved the fries!',
    likes: 12,
    images: []
  }
]

export function getCafeteriaById(id) {
  return cafeterias.find(c => c.id === Number(id))
}

export function getStallsByCafeteria(cafeteriaId) {
  return stalls.filter(s => s.cafeteriaId === Number(cafeteriaId))
}

export function getStallById(id) {
  return stalls.find(s => s.id === Number(id))
}

export function getReviewsByStallId(stallId) {
  return reviews.filter(r => r.stallId === Number(stallId))
}
