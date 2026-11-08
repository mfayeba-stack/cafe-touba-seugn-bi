/* ==== CONFIGURATION DU SITE — modifiez ici prix, produits et numéro ==== */
window.SITE = {
  whatsapp: '221780188809',      // format international, sans +
  phoneDisplay: '78 018 88 09',
  currency: 'FCFA',
  quartiers: [
    'Almadies / Ngor / Ouakam', 'Plateau / Médina / Fann', 'Mermoz / Sacré-Cœur / VDN',
    'Yoff / Nord Foire / Ouest Foire', 'Grand Yoff / HLM / Liberté', 'Guédiawaye / Pikine / Parcelles',
    'Thiès', 'Mbour', 'Autre (à préciser)',
  ],
};

/* active:false => le produit n'est pas affiché sur le site */
window.PRODUCTS = [
  {
    id: 'poudre-1kg', name: 'SEUGN BI Poudre 1kg', short: 'Sachet Poudre 1kg', price: 5000, oldPrice: 6000,
    badge: 'Meilleure vente • Familial', format: '1 Kilogramme', tag: 'Mouture prête à infuser',
    desc: "Le grand sachet familial scellé. Idéal pour la consommation quotidienne en famille et au bureau.",
    image: 'assets/img/banniere-1kg.jpg', active: true, featured: true, icon: 'shopping_cart',
  },
  {
    id: 'poudre-500g', name: 'SEUGN BI Poudre 500g', short: 'Sachet Poudre 500g', price: 2800,
    badge: '', format: '500 Grammes', tag: 'Format découverte',
    desc: 'Parfait pour découvrir le goût pur sans encombrement. Même recette, même mouture aromatique.',
    image: 'assets/img/sachet-salon-2.jpg', active: true, icon: 'shopping_cart',
  },
  {
    id: 'coffret-3x250g', name: 'Coffret Dégustation 3x250g', short: 'Coffret Dégustation 3x250g', price: 4500,
    badge: '', format: 'Coffret 3 x 250g', tag: 'Écrin cadeau Teranga',
    desc: "Trois sachets présentés ensemble. L'attention idéale à offrir, ici ou à la diaspora.",
    image: 'assets/img/banniere-gamme.jpg', active: true, icon: 'redeem',
  },
  {
    // Pas de photo réelle pour ce produit : masqué tant que vous ne l'activez pas.
    id: 'grains-djar-1kg', name: 'Grains Torréfiés & Djar 1kg', short: 'Grains & Djar 1kg', price: 5200,
    badge: '', format: 'Grains & Djar entier', tag: 'Pour connaisseurs',
    desc: 'Café torréfié au feu de bois avec Djar brut, pour ceux qui pilent ou moulent à la demande.',
    image: 'assets/img/sachets-poudre-3.jpg', active: false, icon: 'grain',
  },
];
