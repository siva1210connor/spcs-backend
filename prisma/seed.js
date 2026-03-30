// prisma/seed.js
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in environment");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting single-file seed...");

  // --------------------------------------------------
  // SAFETY: clear data in dependency-safe order
  // --------------------------------------------------
  await prisma.adminAuditLog?.deleteMany?.().catch(() => {});
  await prisma.mediaAsset?.deleteMany?.().catch(() => {});

  await prisma.orderShippingAddress.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  await prisma.review.deleteMany();
  await prisma.feedback.deleteMany();

  await prisma.galleryImage.deleteMany();
  await prisma.gallery.deleteMany();
  await prisma.galleryAlbum.deleteMany();

  await prisma.schemeEnrollment.deleteMany();
  await prisma.scheme.deleteMany();

  await prisma.bulletin.deleteMany();
  await prisma.archive.deleteMany();
  await prisma.catalogue.deleteMany();
  await prisma.download.deleteMany();

  await prisma.ad.deleteMany();
  await prisma.award.deleteMany();
  await prisma.eventItem.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.slider.deleteMany();

  await prisma.rule.deleteMany().catch(() => {});

  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();

  await prisma.refreshToken.deleteMany();
  await prisma.profile.deleteMany();

  await prisma.book.deleteMany();
  await prisma.category.deleteMany();

  // Important: keep admin if you want, but here we reset users too
  await prisma.user.deleteMany();

  // --------------------------------------------------
  // USERS
  // --------------------------------------------------
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

 await prisma.user.create({
    data: {
      name: "SPCS Super Admin",
      email: "admin@spcsbooks.com",
      phone: "9999999999",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const usersData = [
    {
      name: "Arun Kumar",
      email: "arun.kumar@example.com",
      phone: "9000000001",
      profile: {
        state: "Kerala",
        city: "Alappuzha",
        district: "Alappuzha",
        country: "India",
        addressOne: "Karippassery House",
        addressTwo: "Near KSRTC Bus Stand",
        pincode: "688001",
      },
    },
    {
      name: "Meera Nair",
      email: "meera.nair@example.com",
      phone: "9000000002",
      profile: {
        state: "Kerala",
        city: "Kottayam",
        district: "Kottayam",
        country: "India",
        addressOne: "Mannamkulam Road",
        addressTwo: "Opp. Library",
        pincode: "686001",
      },
    },
    {
      name: "Rohit Menon",
      email: "rohit.menon@example.com",
      phone: "9000000003",
      profile: {
        state: "Kerala",
        city: "Ernakulam",
        district: "Ernakulam",
        country: "India",
        addressOne: "Panampilly Nagar",
        addressTwo: "Block B",
        pincode: "682036",
      },
    },
    {
      name: "Lakshmi Pillai",
      email: "lakshmi.pillai@example.com",
      phone: "9000000004",
      profile: {
        state: "Kerala",
        city: "Thiruvananthapuram",
        district: "Thiruvananthapuram",
        country: "India",
        addressOne: "Pattom Junction",
        addressTwo: "Near Medical College",
        pincode: "695004",
      },
    },
    {
      name: "Nikhil Varma",
      email: "nikhil.varma@example.com",
      phone: "9000000005",
      profile: {
        state: "Kerala",
        city: "Thrissur",
        district: "Thrissur",
        country: "India",
        addressOne: "MG Road",
        addressTwo: "North Bus Stand",
        pincode: "680001",
      },
    },
    {
      name: "Anjali Joseph",
      email: "anjali.joseph@example.com",
      phone: "9000000006",
      profile: {
        state: "Kerala",
        city: "Kozhikode",
        district: "Kozhikode",
        country: "India",
        addressOne: "Beach Road",
        addressTwo: "Near Park",
        pincode: "673032",
      },
    },
    {
      name: "Harishankar S",
      email: "harishankar@example.com",
      phone: "9000000007",
      profile: {
        state: "Kerala",
        city: "Kannur",
        district: "Kannur",
        country: "India",
        addressOne: "Talap",
        addressTwo: "Temple Road",
        pincode: "670002",
      },
    },
    {
      name: "Devika R",
      email: "devika.r@example.com",
      phone: "9000000008",
      profile: {
        state: "Kerala",
        city: "Palakkad",
        district: "Palakkad",
        country: "India",
        addressOne: "Civil Station",
        addressTwo: "Near Collectorate",
        pincode: "678001",
      },
    },
  ];

  const users = [];
  for (const u of usersData) {
    const createdUser = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: "USER",
        profile: {
          create: u.profile,
        },
        cart: {
          create: {},
        },
        wishlist: {
          create: {},
        },
      },
      include: {
        profile: true,
        cart: true,
        wishlist: true,
      },
    });
    users.push(createdUser);
  }

  // --------------------------------------------------
  // CATEGORIES
  // --------------------------------------------------
  const categoryNames = [
    "Malayalam Literature",
    "Spiritual",
    "Children",
    "History",
    "Biography",
    "Philosophy",
    "Poetry",
    "Fiction",
  ];

  const categories = {};
  for (const name of categoryNames) {
    const category = await prisma.category.create({ data: { name } });
    categories[name] = category;
  }

  // --------------------------------------------------
  // BOOKS
  // --------------------------------------------------
  const booksSeed = [
    {
      name: "Randamoozham",
      malayalamName: "രണ്ടാമൂഴം",
      author: "M. T. Vasudevan Nair",
      authorMalayalam: "എം. ടി. വാസുദേവൻ നായർ",
      type: "HARD_COPY",
      category: "Malayalam Literature",
      price: 550,
      bestSeller: true,
      newArrival: false,
      awardWinner: true,
      republication: true,
      highlight: true,
      rank: "1",
      description: "A landmark retelling of the Mahabharata through Bhima's eyes.",
      edition: "25th Edition",
      isbn: "9788126405670",
      numOfPages: "560",
      publisher: "DC Books",
      language: "Malayalam",
      stock: 40,
      unlimitedStock: false,
      coverImageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Khasakkinte Ithihasam",
      malayalamName: "ഖസാക്കിന്റെ ഇതിഹാസം",
      author: "O. V. Vijayan",
      authorMalayalam: "ഒ. വി. വിജയൻ",
      type: "HARD_COPY",
      category: "Malayalam Literature",
      price: 420,
      bestSeller: true,
      newArrival: false,
      awardWinner: true,
      republication: true,
      highlight: true,
      rank: "2",
      description: "A modern Malayalam classic that transformed narrative fiction.",
      edition: "18th Edition",
      isbn: "9788126401245",
      numOfPages: "180",
      publisher: "DC Books",
      language: "Malayalam",
      stock: 32,
      unlimitedStock: false,
      coverImageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Aadujeevitham",
      malayalamName: "ആടുജീവിതം",
      author: "Benyamin",
      authorMalayalam: "ബെന്യാമിൻ",
      type: "HARD_COPY",
      category: "Fiction",
      price: 360,
      bestSeller: true,
      newArrival: false,
      awardWinner: true,
      republication: true,
      highlight: true,
      rank: "3",
      description: "A powerful survival novel based on the migrant experience.",
      edition: "20th Edition",
      isbn: "9788126419890",
      numOfPages: "224",
      publisher: "Green Books",
      language: "Malayalam",
      stock: 50,
      unlimitedStock: false,
      coverImageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Naalukettu",
      malayalamName: "നാലുകെട്ട്",
      author: "M. T. Vasudevan Nair",
      authorMalayalam: "എം. ടി. വാസുദേവൻ നായർ",
      type: "EBOOK",
      category: "Fiction",
      price: 199,
      bestSeller: false,
      newArrival: true,
      awardWinner: false,
      republication: true,
      highlight: false,
      rank: "10",
      description: "A coming-of-age story set within the fading feudal household.",
      edition: "Digital Edition",
      isbn: "9788126407777",
      numOfPages: "280",
      publisher: "DC Books",
      language: "Malayalam",
      stock: 0,
      unlimitedStock: true,
      coverImageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Yakshi",
      malayalamName: "യക്ഷി",
      author: "Malayattoor Ramakrishnan",
      authorMalayalam: "മലയാറ്റൂർ രാമകൃഷ്ണൻ",
      type: "AUDIOBOOK",
      category: "Fiction",
      price: 299,
      bestSeller: false,
      newArrival: true,
      awardWinner: false,
      republication: false,
      highlight: true,
      rank: "14",
      description: "A psychological thriller in Malayalam literature.",
      edition: "Audio Edition",
      isbn: "9788126488881",
      numOfPages: "210",
      publisher: "Audio SPCS",
      language: "Malayalam",
      stock: 0,
      unlimitedStock: true,
      coverImageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Bhagavad Gita",
      malayalamName: "ഭഗവദ്ഗീത",
      author: "Vyasa",
      authorMalayalam: "വ്യാസൻ",
      type: "HARD_COPY",
      category: "Spiritual",
      price: 250,
      bestSeller: true,
      newArrival: false,
      awardWinner: false,
      republication: true,
      highlight: false,
      rank: "7",
      description: "A spiritual classic with Malayalam commentary.",
      edition: "Revised Edition",
      isbn: "9788180001122",
      numOfPages: "300",
      publisher: "SPCS Publications",
      language: "Malayalam",
      stock: 65,
      unlimitedStock: false,
      coverImageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Sree Narayana Guru Jeevacharithram",
      malayalamName: "ശ്രീ നാരായണ ഗുരു ജീവിതചരിത്രം",
      author: "Dr. T. Bhaskaran",
      authorMalayalam: "ഡോ. ടി. ഭാസ്കരൻ",
      type: "HARD_COPY",
      category: "Biography",
      price: 320,
      bestSeller: false,
      newArrival: true,
      awardWinner: false,
      republication: false,
      highlight: false,
      rank: "18",
      description: "A detailed biography of Sree Narayana Guru.",
      edition: "1st Edition",
      isbn: "9788199991234",
      numOfPages: "260",
      publisher: "SPCS Publications",
      language: "Malayalam",
      stock: 22,
      unlimitedStock: false,
      coverImageUrl: "https://images.unsplash.com/photo-1511108690759-009324a90311?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Kerala Charithram",
      malayalamName: "കേരള ചരിത്രം",
      author: "A. Sreedhara Menon",
      authorMalayalam: "എ. ശ്രീധര മേനോൻ",
      type: "HARD_COPY",
      category: "History",
      price: 480,
      bestSeller: false,
      newArrival: false,
      awardWinner: false,
      republication: true,
      highlight: false,
      rank: "25",
      description: "A foundational text on Kerala history.",
      edition: "12th Edition",
      isbn: "9788171309999",
      numOfPages: "400",
      publisher: "Current Books",
      language: "Malayalam",
      stock: 18,
      unlimitedStock: false,
      coverImageUrl: "https://images.unsplash.com/photo-1526243741027-444d633d7365?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Kunjunni Kavithakal",
      malayalamName: "കുഞ്ഞുണ്ണി കവിതകൾ",
      author: "Kunjunni Mash",
      authorMalayalam: "കുഞ്ഞുണ്ണി മാഷ്",
      type: "HARD_COPY",
      category: "Children",
      price: 180,
      bestSeller: true,
      newArrival: false,
      awardWinner: false,
      republication: true,
      highlight: false,
      rank: "11",
      description: "Beloved poems for children and families.",
      edition: "15th Edition",
      isbn: "9788126403331",
      numOfPages: "96",
      publisher: "DC Books",
      language: "Malayalam",
      stock: 70,
      unlimitedStock: false,
      coverImageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Jeevitham Oru Darshanam",
      malayalamName: "ജീവിതം ഒരു ദർശനം",
      author: "Nitya Chaitanya Yati",
      authorMalayalam: "നിത്യ ചൈതന്യ യതി",
      type: "EBOOK",
      category: "Philosophy",
      price: 149,
      bestSeller: false,
      newArrival: true,
      awardWinner: false,
      republication: false,
      highlight: true,
      rank: "21",
      description: "A philosophical reflection on life and meaning.",
      edition: "Digital Edition",
      isbn: "9788191234567",
      numOfPages: "210",
      publisher: "SPCS Digital",
      language: "Malayalam",
      stock: 0,
      unlimitedStock: true,
      coverImageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  const createdBooks = [];
  for (const b of booksSeed) {
    const book = await prisma.book.create({
      data: {
        name: b.name,
        malayalamName: b.malayalamName,
        author: b.author,
        authorMalayalam: b.authorMalayalam,
        type: b.type,
        bestSeller: b.bestSeller,
        newArrival: b.newArrival,
        awardWinner: b.awardWinner,
        republication: b.republication,
        highlight: b.highlight,
        rank: b.rank,
        description: b.description,
        edition: b.edition,
        isbn: b.isbn,
        numOfPages: b.numOfPages,
        publisher: b.publisher,
        language: b.language,
        price: b.price,
        status: "ACTIVE",
        unlimitedStock: b.unlimitedStock,
        stock: b.stock,
        coverImageUrl: b.coverImageUrl,
        categoryId: categories[b.category].id,
      },
    });
    createdBooks.push(book);
  }

  // --------------------------------------------------
  // SLIDERS
  // --------------------------------------------------
  await prisma.slider.createMany({
    data: [
      {
        title: "Summer Reading Festival",
        sliderImgUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1400&auto=format&fit=crop",
        sliderUrl: "https://spcsbooks.com/festival",
      },
      {
        title: "Malayalam Classics Collection",
        sliderImgUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1400&auto=format&fit=crop",
        sliderUrl: "https://spcsbooks.com/classics",
      },
      {
        title: "Audiobook Launches",
        sliderImgUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1400&auto=format&fit=crop",
        sliderUrl: "https://spcsbooks.com/audiobooks",
      },
    ],
  });

  // --------------------------------------------------
  // OFFERS
  // --------------------------------------------------
  await prisma.offer.createMany({
    data: [
      {
        offerImageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop",
        link: "https://spcsbooks.com/offers/summer",
      },
      {
        offerImageUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop",
        link: "https://spcsbooks.com/offers/new-arrivals",
      },
    ],
  });

  // --------------------------------------------------
  // ADS
  // --------------------------------------------------
  await prisma.ad.createMany({
    data: [
      {
        type: "BANNER",
        imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1200&auto=format&fit=crop",
        link: "https://spcsbooks.com/books/randamoozham",
      },
      {
        type: "SQUARE",
        imageUrl: "https://images.unsplash.com/photo-1511108690759-009324a90311?q=80&w=900&auto=format&fit=crop",
        link: "https://spcsbooks.com/schemes/summer-reading",
      },
    ],
  });

  // --------------------------------------------------
  // RULES
  // --------------------------------------------------
  await prisma.rule.createMany({
    data: [
      {
        type: "DISCOUNT",
        fromPrice: 0,
        toPrice: 499,
        isPercentage: true,
        value: 5,
        isActive: true,
      },
      {
        type: "DISCOUNT",
        fromPrice: 500,
        toPrice: 999,
        isPercentage: true,
        value: 10,
        isActive: true,
      },
      {
        type: "DISCOUNT",
        fromPrice: 1000,
        toPrice: 5000,
        isPercentage: false,
        value: 100,
        isActive: true,
      },
      {
        type: "SHIPPING",
        fromPrice: 0,
        toPrice: 499,
        isPercentage: false,
        value: 60,
        isActive: true,
      },
      {
        type: "SHIPPING",
        fromPrice: 500,
        toPrice: 999999,
        isPercentage: false,
        value: 0,
        isActive: true,
      },
    ],
  });

  // --------------------------------------------------
  // EVENTS / NEWS
  // --------------------------------------------------
  await prisma.eventItem.createMany({
    data: [
      {
        type: "NEWS",
        title: "SPCS launches new Malayalam classics imprint",
        date: new Date("2026-03-15"),
        time: "10:30 AM",
        description: "A new publishing line focused on preserving Malayalam literary heritage.",
        imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop",
        fileLink: "https://example.com/news/spcs-classics.pdf",
      },
      {
        type: "NEWS",
        title: "New audiobook catalogue released",
        date: new Date("2026-03-20"),
        time: "11:00 AM",
        description: "A curated audiobook collection is now available.",
        imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1200&auto=format&fit=crop",
        fileLink: null,
      },
      {
        type: "EVENTS",
        title: "Book Fair 2026",
        date: new Date("2026-04-05"),
        time: "05:00 PM",
        description: "Annual SPCS book fair with author sessions and community meetups.",
        imageUrl: "https://images.unsplash.com/photo-1526243741027-444d633d7365?q=80&w=1200&auto=format&fit=crop",
        fileLink: "https://example.com/events/book-fair-2026.pdf",
      },
      {
        type: "EVENTS",
        title: "Children’s Reading Day",
        date: new Date("2026-04-12"),
        time: "03:30 PM",
        description: "A reading event for children with poetry and storytelling.",
        imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop",
        fileLink: null,
      },
    ],
  });

  // --------------------------------------------------
  // AWARDS
  // --------------------------------------------------
  await prisma.award.createMany({
    data: [
      {
        title: "Aksharapuraskaram 2026",
        description: "Award for contribution to Malayalam literature.",
        type: "AKSHARAPURASKARAM",
        imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop",
      },
      {
        title: "National Literary Recognition",
        description: "Recognition for excellence in publishing.",
        type: "AWARDED",
        imageUrl: "https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  });

  // --------------------------------------------------
  // DOWNLOADS
  // --------------------------------------------------
  await prisma.download.createMany({
    data: [
      {
        title: "March 2026 Reading Guide",
        fileUrl: "https://example.com/files/reading-guide-march-2026.pdf",
        fileType: "pdf",
        fileSize: "2.5 MB",
      },
      {
        title: "Children Reading Club Brochure",
        fileUrl: "https://example.com/files/children-reading-club.pdf",
        fileType: "pdf",
        fileSize: "1.2 MB",
      },
    ],
  });

  // --------------------------------------------------
  // CATALOGUE
  // --------------------------------------------------
  await prisma.catalogue.createMany({
    data: [
      {
        title: "2026 Main Book Catalogue",
        fileUrl: "https://example.com/files/catalogue-2026.pdf",
        fileType: "pdf",
        fileSize: "5.1 MB",
        uploadedDate: new Date("2026-03-01"),
      },
      {
        title: "Audiobook Catalogue 2026",
        fileUrl: "https://example.com/files/audiobook-catalogue-2026.pdf",
        fileType: "pdf",
        fileSize: "3.7 MB",
        uploadedDate: new Date("2026-03-05"),
      },
    ],
  });

  // --------------------------------------------------
  // ARCHIVES
  // --------------------------------------------------
  await prisma.archive.createMany({
    data: [
      {
        title: "Archive March 2025",
        fileUrl: "https://example.com/files/archive-march-2025.pdf",
        fileType: "pdf",
        uploadedDate: new Date("2025-03-31"),
      },
      {
        title: "Archive Annual Report 2024",
        fileUrl: "https://example.com/files/annual-report-2024.pdf",
        fileType: "pdf",
        uploadedDate: new Date("2024-12-31"),
      },
    ],
  });

  // --------------------------------------------------
  // BULLETIN
  // --------------------------------------------------
  await prisma.bulletin.createMany({
    data: [
      {
        title: "March 2026 Bulletin",
        imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop",
        date: new Date("2026-03-07"),
        fileUrl: "https://example.com/files/bulletin-march-2026.pdf",
        fileType: "pdf",
        fileSize: "3.2 MB",
      },
      {
        title: "April 2026 Bulletin",
        imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop",
        date: new Date("2026-04-07"),
        fileUrl: "https://example.com/files/bulletin-april-2026.pdf",
        fileType: "pdf",
        fileSize: "3.4 MB",
      },
    ],
  });

  // --------------------------------------------------
  // SCHEME
  // --------------------------------------------------
  const scheme1 = await prisma.scheme.create({
    data: {
      title: "Summer Reading Scheme 2026",
      description: "A seasonal membership scheme with reading benefits and member-only offers.",
      imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop",
      status: "ACTIVE",
    },
  });

  const scheme2 = await prisma.scheme.create({
    data: {
      title: "Children Reading Club",
      description: "Special reading club for young readers with monthly selections.",
      imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop",
      status: "INACTIVE",
    },
  });

  await prisma.schemeEnrollment.createMany({
    data: [
      { schemeId: scheme1.id, userId: users[0].id },
      { schemeId: scheme1.id, userId: users[1].id },
      { schemeId: scheme1.id, userId: users[2].id },
      { schemeId: scheme2.id, userId: users[3].id },
    ],
  });

  // --------------------------------------------------
  // GALLERY
  // --------------------------------------------------
  const album1 = await prisma.galleryAlbum.create({
    data: {
      name: "Book Fair 2026",
    },
  });

  const album2 = await prisma.galleryAlbum.create({
    data: {
      name: "Children Reading Day",
    },
  });

  const gallery1 = await prisma.gallery.create({
    data: {
      albumId: album1.id,
    },
  });

  const gallery2 = await prisma.gallery.create({
    data: {
      albumId: album2.id,
    },
  });

  await prisma.galleryImage.createMany({
    data: [
      {
        galleryId: gallery1.id,
        imageUrl: "https://images.unsplash.com/photo-1526243741027-444d633d7365?q=80&w=1200&auto=format&fit=crop",
        sortOrder: 0,
      },
      {
        galleryId: gallery1.id,
        imageUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop",
        sortOrder: 1,
      },
      {
        galleryId: gallery1.id,
        imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop",
        sortOrder: 2,
      },
      {
        galleryId: gallery2.id,
        imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop",
        sortOrder: 0,
      },
      {
        galleryId: gallery2.id,
        imageUrl: "https://images.unsplash.com/photo-1511108690759-009324a90311?q=80&w=1200&auto=format&fit=crop",
        sortOrder: 1,
      },
    ],
  });

  // --------------------------------------------------
  // FEEDBACK
  // --------------------------------------------------
  await prisma.feedback.createMany({
    data: [
      {
        title: "Late delivery",
        description: "My order was delayed by 3 days.",
        email: "customer1@example.com",
        userId: users[0].id,
      },
      {
        title: "Need more audiobooks",
        description: "Please add more Malayalam audiobook titles.",
        email: "customer2@example.com",
        userId: users[1].id,
      },
      {
        title: "Website suggestion",
        description: "Please improve search filters for category and language.",
        email: "reader@example.com",
      },
    ],
  });

  // --------------------------------------------------
  // REVIEWS
  // --------------------------------------------------
  await prisma.review.createMany({
    data: [
      {
        userId: users[0].id,
        bookId: createdBooks[0].id,
        description: "A masterpiece of Malayalam literature.",
        rating: 5,
        status: "PUBLISHED",
      },
      {
        userId: users[1].id,
        bookId: createdBooks[2].id,
        description: "Emotionally powerful and unforgettable.",
        rating: 5,
        status: "PENDING",
      },
      {
        userId: users[2].id,
        bookId: createdBooks[5].id,
        description: "Beautiful presentation and helpful commentary.",
        rating: 4,
        status: "ACTIVE",
      },
    ],
  });

  // --------------------------------------------------
  // ORDERS
  // --------------------------------------------------
  const order1 = await prisma.order.create({
    data: {
      orderNo: "ORD-2026-0001",
      userId: users[0].id,
      type: "BOOK",
      status: "COMPLETED",
      transactionId: "TXN-2026-0001",
      subtotal: 970,
      shippingCharge: 0,
      total: 870,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order1.id,
        bookId: createdBooks[0].id,
        quantity: 1,
        price: 550,
      },
      {
        orderId: order1.id,
        bookId: createdBooks[1].id,
        quantity: 1,
        price: 420,
      },
    ],
  });

  await prisma.orderShippingAddress.create({
    data: {
      orderId: order1.id,
      name: users[0].name,
      address: "Karippassery House, Near KSRTC Bus Stand",
      district: "Alappuzha",
      state: "Kerala",
      pinCode: "688001",
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNo: "ORD-2026-0002",
      userId: users[1].id,
      type: "EBOOK",
      status: "PENDING",
      transactionId: "TXN-2026-0002",
      subtotal: 199,
      shippingCharge: 0,
      total: 199,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      bookId: createdBooks[3].id,
      quantity: 1,
      price: 199,
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNo: "ORD-2026-0003",
      userId: users[2].id,
      type: "AUDIOBOOK",
      status: "FULFILLED",
      transactionId: "TXN-2026-0003",
      subtotal: 299,
      shippingCharge: 0,
      total: 299,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      bookId: createdBooks[4].id,
      quantity: 1,
      price: 299,
    },
  });

  const order4 = await prisma.order.create({
    data: {
      orderNo: "ORD-2026-0004",
      userId: users[3].id,
      type: "BOOK",
      status: "SHIPPED",
      transactionId: "TXN-2026-0004",
      subtotal: 500,
      shippingCharge: 60,
      total: 560,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order4.id,
      bookId: createdBooks[8].id,
      quantity: 2,
      price: 250,
    },
  });

  await prisma.orderShippingAddress.create({
    data: {
      orderId: order4.id,
      name: users[3].name,
      address: "Pattom Junction, Near Medical College",
      district: "Thiruvananthapuram",
      state: "Kerala",
      pinCode: "695004",
    },
  });

  // --------------------------------------------------
  // CART / WISHLIST sample entries
  // --------------------------------------------------
  const user1Cart = await prisma.cart.findUnique({
    where: { userId: users[0].id },
  });

  const user1Wishlist = await prisma.wishlist.findUnique({
    where: { userId: users[0].id },
  });

  if (user1Cart) {
    await prisma.cartItem.createMany({
      data: [
        {
          cartId: user1Cart.id,
          bookId: createdBooks[2].id,
          quantity: 1,
        },
        {
          cartId: user1Cart.id,
          bookId: createdBooks[5].id,
          quantity: 2,
        },
      ],
    });
  }

  if (user1Wishlist) {
    await prisma.wishlistItem.createMany({
      data: [
        {
          wishlistId: user1Wishlist.id,
          bookId: createdBooks[3].id,
        },
        {
          wishlistId: user1Wishlist.id,
          bookId: createdBooks[4].id,
        },
      ],
    });
  }

  console.log("✅ Single-file seed completed");
  console.log("--------------------------------------------------");
  console.log("Admin Login");
  console.log("Phone   : 9999999999");
  console.log("Password: admin123");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });