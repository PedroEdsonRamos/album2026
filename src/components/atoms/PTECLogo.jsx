import ptecLogo from "@/assets/PTEC_Solutions_logo_VECTOR.svg";

export function PTECLogo({ height = 58 }) {
  return (
    <img
      src={ptecLogo}
      alt="PTEC Solutions"
      style={{ height, width: "auto", objectFit: "contain", display: "block" }}
    />
  );
}
