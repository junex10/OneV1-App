import { LocationProvider } from "./location";
import { ApiProvider } from "./api";

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ApiProvider>
    <LocationProvider>{children}</LocationProvider>
  </ApiProvider>
);

export default Providers;
