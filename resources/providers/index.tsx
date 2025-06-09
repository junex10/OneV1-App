import { LocationProvider } from "./location";
import { ApiProvider } from "./api";
import { SocketProvider } from "./socket";

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ApiProvider>
    <SocketProvider>
      <LocationProvider>{children}</LocationProvider>
    </SocketProvider>
  </ApiProvider>
);

export default Providers;
