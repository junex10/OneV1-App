import { LocationProvider } from "./location";

const Providers = ({ children }: { children: React.ReactNode }) => (
  <LocationProvider>
    {children}
  </LocationProvider>
);

export default Providers;