// Hard-coded cafeteria menu (Scenario 1 — Campus Cafeteria POS).
// Prices are in Philippine pesos.
// "image" is optional — products without one show their emoji icon instead.
// "fit: contain" shows the whole photo (for photos on a white background).
const PRODUCTS = [
  { id: 1, name: "Rice (Plain)",         price: 15.00, category: "Rice",  icon: "🍚", image: "assets/images/rice.jpg" },
  { id: 2, name: "Fried Chicken (1 pc)", price: 65.00, category: "Viand", icon: "🍗", image: "assets/images/fried-chicken.jpg", fit: "contain" },
  { id: 3, name: "Pork Adobo",           price: 60.00, category: "Viand", icon: "🍖" },
  { id: 4, name: "Vegetable Side Dish",  price: 35.00, category: "Side",  icon: "🥗", image: "assets/images/vegetable-side-dish.jpg" },
  { id: 5, name: "Iced Tea (cup)",       price: 20.00, category: "Drink", icon: "🧋" },
  { id: 6, name: "Bottled Water",        price: 20.00, category: "Drink", icon: "💧", image: "assets/images/bottled-water.jpg", fit: "contain" }
];
