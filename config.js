/*
  Configuración pública del frontend.
  publishableKey y policyVersion no son secretos.
  NUNCA coloques aquí SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SECRET_KEY o RESEND_API_KEY.
  Cuando se apruebe la política definitiva, sincroniza policyVersion con el secreto PRIVACY_POLICY_VERSION.
*/
window.LE_CONFIG = {
  supabaseUrl: "",
  publishableKey: "",
  policyVersion: "v1.0-borrador"
};