import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "entities.json");

const baseImage = "https://media.base44.com/images/public/69431e0c00397efc6e14e9df";

const APPAREL_VARIANTS = [
  { name: "BRANCA", hex: "#ffffff", front_url: "/mockups/tshirt-white-front.png", back_url: "/mockups/tshirt-white-back.jpg" },
  { name: "PRETA", hex: "#000000", front_url: "/mockups/tshirt-black-front.png", back_url: "/mockups/tshirt-black-back.jpg" },
  { name: "AZUL MARINHO", hex: "#1e3a8a", front_url: "/mockups/tshirt-navy-front.png", back_url: "/mockups/tshirt-navy-back.jpg" },
  { name: "CINZA", hex: "#6b7280", front_url: "/mockups/tshirt-gray-front.png", back_url: "/mockups/tshirt-gray-back.jpg" }
];

const DEFAULT_PRODUCTS = [
  {
    id: "fallback-camiseta",
    name: "Camiseta Essencial",
    type: "camiseta",
    catalog_product: true,
    is_active: true,
    base_price: 59.9,
    sizes_available: ["P", "M", "G", "GG"],
    colors_available: ["BRANCA", "PRETA", "AZUL MARINHO", "CINZA"],
    front_model_url: "/mockups/tshirt-white-front.png",
    back_model_url: "/mockups/tshirt-white-back.jpg",
    product_color_variants: APPAREL_VARIANTS,
    created_date: new Date().toISOString(),
  },
  {
    id: "fallback-baby-look",
    name: "Baby Look Essencial",
    type: "baby_look",
    catalog_product: true,
    is_active: true,
    base_price: 49.9,
    sizes_available: ["P", "M", "G", "GG"],
    colors_available: ["BRANCA", "PRETA", "AZUL MARINHO", "CINZA"],
    front_model_url: "/mockups/tshirt-white-front.png",
    back_model_url: "/mockups/tshirt-white-back.jpg",
    product_color_variants: APPAREL_VARIANTS,
    created_date: new Date().toISOString(),
  },
  {
    id: "fallback-caneca",
    name: "Caneca Aurora",
    type: "caneca",
    catalog_product: true,
    is_active: true,
    base_price: 39.9,
    sizes_available: ["325ml"],
    colors_available: ["BRANCA"],
    front_model_url: `${baseImage}/a376cd8cc_generated_image.png`,
    back_model_url: `${baseImage}/9373e007c_generated_image.png`,
    product_color_variants: [
      {
        name: "BRANCA",
        hex: "#ffffff",
        front_url: `${baseImage}/a376cd8cc_generated_image.png`,
        back_url: `${baseImage}/9373e007c_generated_image.png`,
      },
    ],
    created_date: new Date().toISOString(),
  },
  {
    id: "fallback-ecobag",
    name: "Ecobag Horizonte",
    type: "ecobag",
    catalog_product: true,
    is_active: true,
    base_price: 34.9,
    sizes_available: ["Único"],
    colors_available: ["PRETA"],
    front_model_url: `${baseImage}/373ae2537_generated_image.png`,
    back_model_url: `${baseImage}/020045638_generated_image.png`,
    product_color_variants: [
      {
        name: "PRETA",
        hex: "#000000",
        front_url: `${baseImage}/373ae2537_generated_image.png`,
        back_url: `${baseImage}/020045638_generated_image.png`,
      },
    ],
    created_date: new Date().toISOString(),
  },
  {
    id: "fallback-quadro",
    name: "Quadro Janela",
    type: "quadro",
    catalog_product: true,
    is_active: true,
    base_price: 89.9,
    sizes_available: ["A4", "A3"],
    colors_available: ["PRETO"],
    front_model_url: `${baseImage}/97e914a15_generated_image.png`,
    back_model_url: `${baseImage}/aa3ec4f0d_generated_image.png`,
    product_color_variants: [
      {
        name: "PRETO",
        hex: "#000000",
        front_url: `${baseImage}/97e914a15_generated_image.png`,
        back_url: `${baseImage}/aa3ec4f0d_generated_image.png`,
      },
    ],
    created_date: new Date().toISOString(),
  },
];

const photos = [
  "1550859492-d5da9d8e45f3",
  "1511497584788-876760111969",
  "1487958449943-2429e8be8625",
  "1549490349-8643362247b5",
  "1577083552431-6e5fd01aa342",
  "1517841905240-472988babdf9",
  "1557682250-33bd709cbe85",
  "1500530855697-b586d89ba3ee",
  "1550745165-9bc0b252726f",
  "1541701494587-cb58502866ab",
];
const titles = [
  "Sol de Dentro",
  "Mata Atlântica",
  "Concreto Vivo",
  "Linha Serena",
  "Bicho do Céu",
  "Vai Dar Céu",
  "Órbita Tropical",
  "Postal 1987",
  "Maré Criativa",
  "Noite Brasileira",
];
const categories = [
  "abstrato",
  "natureza",
  "urbano",
  "minimalista",
  "ilustracao",
  "tipografia",
  "geometrico",
  "vintage",
  "pop_art",
  "surreal",
];

const DEFAULT_DESIGNS = titles.map((title, index) => ({
  id: `fallback-design-${index + 1}`,
  title,
  artist_name: "Céu Criativa",
  artist_id: "artist_user_1",
  description: "Estampa de demonstração do catálogo.",
  image_url: `https://images.unsplash.com/photo-${photos[index]}?auto=format&fit=crop&w=1200&q=85`,
  price_base: 19.9,
  category: categories[index],
  tags: ["arte", "céu"],
  status: "aprovado",
  is_featured: true,
  likes_count: 12 + index * 3,
  sales_count: index * 4,
  created_date: new Date(Date.now() - index * 86400000).toISOString(),
}));

const DEFAULT_CATEGORIES = categories.map((cat, idx) => ({
  id: `cat-${idx + 1}`,
  name: cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " "),
  slug: cat,
  position_order: idx,
}));

const DEFAULT_COLLECTIONS = [
  {
    id: "col-1",
    name: "Destaques do Céu",
    slug: "destaques-do-ceu",
    description: "Estampas mais procuradas pelos criadores.",
    is_public: true,
    is_active: true,
    position_order: 1,
  },
  {
    id: "col-2",
    name: "Natureza Brasileira",
    slug: "natureza-brasileira",
    description: "Biomas, fauna e flora em traços contemporâneos.",
    is_public: true,
    is_active: true,
    position_order: 2,
  },
];

const DEFAULT_COMPETITION = [
  {
    id: "comp-1",
    title: "Cores do Verão",
    theme: "Verão Tropical & Movimento",
    description: "Concurso aberto para artistas criarem a melhor estampa temática de verão.",
    banner_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    status: "active",
    start_date: new Date(Date.now() - 7 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    prize_description: "R$ 2.500 em dinheiro + produção e destaque nacional",
    submissions_count: 8,
    created_date: new Date().toISOString(),
  },
];

export const DEFAULT_USER = {
  id: "artist_user_1",
  name: "Felipe Silvério",
  full_name: "Felipe Silvério",
  artist_name: "Felipe Silvério",
  email: "felipeatmaag@gmail.com",
  cpf: "",
  pix_key: "",
  phone: "",
  role: "admin",
  app_role: "master",
  store_slug: "ceu-criativa",
  store_name: "Céu Criativa Studio",
  bio: "Estúdio de design e ilustrações autorais no Céu Criativa.",
  avatar_url: "",
  has_completed_profile: false,
  has_purchased_first_print: false,
  store_active: false,
  total_sales: 0,
  rating: 5.0,
  access_status: "active",
  created_date: "2025-01-01T00:00:00.000Z",
};

export const DEFAULT_COMMISSION = [
  {
    id: "comm_1",
    artist_id: "artist_user_1",
    rate_percentage: 20,
    pending_balance: 340.5,
    paid_balance: 1820.0,
    updated_date: new Date().toISOString(),
  },
];

class EntitiesStore {
  private data: Record<string, any[]> = {};
  public currentUser = { ...DEFAULT_USER };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch {}
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        this.data = parsed.data || {};
        if (parsed.currentUser) {
          this.currentUser = {
            ...this.currentUser,
            ...parsed.currentUser,
            name: parsed.currentUser.name || parsed.currentUser.full_name || "Artista Criativo",
          };
        }
        // Auto-match Felipe or first admin user
        const matchedUser = this.data.User?.find(
          (u: any) => u.email === "felipeatmaag@gmail.com" || u.id === "69431e0c00397efc6e14e9e0"
        );
        if (matchedUser) {
          this.currentUser = {
            ...this.currentUser,
            ...matchedUser,
            name: matchedUser.name || matchedUser.full_name || matchedUser.artist_name || "Felipe Silvério",
          };
        }

        const hasExistingOrder = this.data.Order?.some(
          (o: any) => o.customer_email === this.currentUser.email || o.artist_id === this.currentUser.id
        );
        if (hasExistingOrder) {
          this.currentUser.has_purchased_first_print = true;
          this.currentUser.store_active = true;
        }
      } catch {
        this.seedDefaults();
      }
    } else {
      this.seedDefaults();
    }

    // Ensure essential collections exist
    if (!this.data.Product || this.data.Product.length === 0) {
      this.data.Product = [...DEFAULT_PRODUCTS];
    }
    if (!this.data.Design || this.data.Design.length === 0) {
      this.data.Design = [...DEFAULT_DESIGNS];
    }
    if (!this.data.Category || this.data.Category.length === 0) {
      this.data.Category = [...DEFAULT_CATEGORIES];
    }
    if (!this.data.Collection || this.data.Collection.length === 0) {
      this.data.Collection = [...DEFAULT_COLLECTIONS];
    }
    if (!this.data.Competition || this.data.Competition.length === 0) {
      this.data.Competition = [...DEFAULT_COMPETITION];
    }
    if (!this.data.ArtistCommission || this.data.ArtistCommission.length === 0) {
      this.data.ArtistCommission = [...DEFAULT_COMMISSION];
    }
    if (!this.data.User || this.data.User.length === 0) {
      this.data.User = [{ ...this.currentUser }];
    }
    this.persist();
  }

  private seedDefaults() {
    this.data = {
      Product: [...DEFAULT_PRODUCTS],
      Design: [...DEFAULT_DESIGNS],
      Category: [...DEFAULT_CATEGORIES],
      Collection: [...DEFAULT_COLLECTIONS],
      Competition: [...DEFAULT_COMPETITION],
      ArtistCommission: [...DEFAULT_COMMISSION],
      User: [{ ...this.currentUser }],
      Like: [],
      Comment: [],
      Follow: [],
      Order: [],
      LoyaltyPoint: [],
      Reward: [],
      RewardRedemption: [],
      BaseProductVariant: [],
      DesignView: [],
    };
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(
        DB_FILE,
        JSON.stringify(
          {
            data: this.data,
            currentUser: this.currentUser,
          },
          null,
          2
        ),
        "utf-8"
      );
    } catch (e) {
      console.error("[EntitiesStore] Failed to persist:", e);
    }
  }

  public getCollection(name: string): any[] {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  public list(name: string, options: { sort?: string; limit?: number; skip?: number; q?: any } = {}): any[] {
    const coll = this.getCollection(name);
    let results = [...coll];

    // Filter by query object
    if (options.q && typeof options.q === "object") {
      results = results.filter((item) => {
        for (const [key, val] of Object.entries(options.q)) {
          if (val === undefined) continue;

          // Flexible artist lookup
          if (key === "artist_id") {
            const matchesArtist =
              item.artist_id === val ||
              item.created_by_id === val ||
              (typeof val === "string" && (
                item.created_by?.toLowerCase() === val.toLowerCase() ||
                item.artist_name?.toLowerCase() === val.toLowerCase()
              ));
            if (!matchesArtist) return false;
            continue;
          }

          if (item[key] === val) continue;
          if (val === true && (item[key] === true || item[key] === "true")) continue;
          if (val === false && (item[key] === false || item[key] === "false")) continue;
          if (val === "true" && (item[key] === true || item[key] === "true")) continue;
          if (val === "false" && (item[key] === false || item[key] === "false")) continue;
          if (String(item[key]) === String(val)) continue;
          return false;
        }
        return true;
      });
    }

    // Sort
    if (options.sort) {
      const isDesc = options.sort.startsWith("-");
      const field = isDesc ? options.sort.slice(1) : options.sort;
      results.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (typeof valA === "number" && typeof valB === "number") {
          return isDesc ? valB - valA : valA - valB;
        }
        if (valA < valB) return isDesc ? 1 : -1;
        return isDesc ? -1 : 1;
      });
    }

    const skip = options.skip || 0;
    const limit = options.limit !== undefined ? options.limit : (name === "Design" || name === "Product" || name === "User" ? 250 : 100);
    return results.slice(skip, skip + limit);
  }

  public get(name: string, id: string) {
    const coll = this.getCollection(name);
    return coll.find((item) => String(item.id) === String(id)) || null;
  }

  public create(name: string, data: any) {
    const coll = this.getCollection(name);
    const id = data.id || `ent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const created = {
      ...data,
      id,
      created_date: data.created_date || new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };
    coll.unshift(created);
    this.persist();
    return created;
  }

  public update(name: string, id: string, data: any) {
    const coll = this.getCollection(name);
    const index = coll.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
      return this.create(name, { ...data, id });
    }
    const updated = {
      ...coll[index],
      ...data,
      id,
      updated_date: new Date().toISOString(),
    };
    coll[index] = updated;
    this.persist();
    return updated;
  }

  public delete(name: string, id: string) {
    const coll = this.getCollection(name);
    const index = coll.findIndex((item) => String(item.id) === String(id));
    if (index !== -1) {
      coll.splice(index, 1);
      this.persist();
      return true;
    }
    return false;
  }

  public deleteMany(name: string, query: any) {
    if (!query) return 0;
    let coll = this.getCollection(name);
    const initialLen = coll.length;

    let idSet: Set<string> | null = null;
    if (Array.isArray(query)) {
      idSet = new Set(query.map(String));
    } else if (Array.isArray(query.ids)) {
      idSet = new Set(query.ids.map(String));
    }

    if (idSet) {
      this.data[name] = coll.filter((item) => !idSet.has(String(item.id)));
    } else if (typeof query === "object") {
      this.data[name] = coll.filter((item) => {
        for (const [k, v] of Object.entries(query)) {
          if (item[k] === v) return false;
        }
        return true;
      });
    }
    this.persist();
    return initialLen - this.data[name].length;
  }

  public updateMe(data: any) {
    this.currentUser = {
      ...this.currentUser,
      ...data,
      updated_date: new Date().toISOString(),
    };
    // Also update in User collection
    this.update("User", this.currentUser.id, this.currentUser);
    this.persist();
    return this.currentUser;
  }
}

export const entitiesStore = new EntitiesStore();
