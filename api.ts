// ─── API Service ──────────────────────────────────────────────────────────────
// Base URL for all FitRow API calls
const BASE_URL = 'https://fitrow.work/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  sex: string;
  main_goal: string;
  training_goal: string;
  motivates_exercise: string;
  body_type: string;
  target_zone: string;
  last_happy_body: string;
  fitness_level: string;
  many_push_ups: string;
  live_elementary: string;
  walk_daily: string;
  feel_meals: string;
  get_sleep: string;
  water_consumption: string;
  tall: string | number;
  weight: string | number;
  goal_weight: string | number;
  old: string | number;
  training_location: string;
  Interested_in: string;
  diet: string;
  name: string;
  phone: string;
  device_token: string;
  days_exercise: string;
  dite_id?: string;
  calories?: string;
  country_code?: string;
}

export interface RegisterResponse {
  status: boolean;
  data: {
    token: string;
    name: string;
  };
  message?: string;
}

export interface OrderPayload {

  package_id: string;
  payment_id: string;
  total: string;
  type: string;
}

export interface Package {
  id: number;
  title: string;
  description: string;
  name: string;
  details: string;
  point: null | unknown;
  discount: null | number;
  duration: string;
  price: string;
  type: number;
  coach: number;
  status: number;
  additional_member_price: number;
  image: string;
}

export interface PackagesResponse {
  status: boolean;
  data: Package[];
}

export interface OrderResponse {
  status: boolean;
  /** MyFatoorah (or other gateway) payment URL to redirect the user to */
  data: string;
  order_id: number;
  additional_members_orders: null | unknown;
  subscription_extension_orders: null | unknown;
  message?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a FormData object from a plain record */
function toFormData(payload: Record<string, string | number | undefined>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    fd.append(key, value !== undefined && value !== null ? String(value) : '');
  }
  return fd;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/**
 * POST /register
 * Registers a new user and returns an auth token.
 */
export async function registerUser(payload: RegisterPayload, lang?: string): Promise<RegisterResponse> {
  const headers: Record<string, string> = {};
  if (lang) {
    headers['Accept-Language'] = lang;
    headers['lang'] = lang;
  }

  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers,
    body: toFormData(payload as unknown as Record<string, string | number | undefined>),
  });

  if (!response.ok) {
    throw new Error(`Register failed: ${response.status} ${response.statusText}`);
  }

  const json: RegisterResponse = await response.json();

  if (!json.status) {
    throw new Error(json.message || 'Registration was rejected by the server.');
  }

  return json;
}

/**
 * POST /orders
 * Places an order using the previously obtained auth token.
 * The token must be passed as a Bearer token in the Authorization header.
 */
export async function placeOrder(token: string, payload: OrderPayload, lang?: string): Promise<OrderResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (lang) {
    headers['Accept-Language'] = lang;
    headers['lang'] = lang;
  }

  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers,
    body: toFormData(payload as unknown as Record<string, string | number | undefined>),
  });

  if (!response.ok) {
    throw new Error(`Order failed: ${response.status} ${response.statusText}`);
  }

  const json: OrderResponse = await response.json();
  return json;
}

/**
 * POST /packages
 * Fetches the packages lists.
 */
export async function getPackages(type: number, lang?: string): Promise<PackagesResponse> {
  const headers: Record<string, string> = {};
  if (lang) {
    headers['Accept-Language'] = lang;
    headers['lang'] = lang;
  }

  const response = await fetch(`${BASE_URL}/packages?type=1&coach=1`, {
    method: 'POST',
    headers,
    body: toFormData({ type }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch packages: ${response.status} ${response.statusText}`);
  }

  const json: PackagesResponse = await response.json();
  return json;
}

export interface PaymentMethod {
  id: number;
  title: string;
  image: string;
}

export interface PaymentResponse {
  status: boolean;
  data: PaymentMethod[];
}

/**
 * GET /payment
 * Fetches the available payment methods.
 */
export async function getPaymentMethods(token: string, lang?: string): Promise<PaymentResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (lang) {
    headers['Accept-Language'] = lang;
    headers['lang'] = lang;
  }

  const response = await fetch(`${BASE_URL}/payment?device_type=web`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch payment methods: ${response.status} ${response.statusText}`);
  }

  const json: PaymentResponse = await response.json();
  return json;
}


