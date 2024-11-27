import { useMonitoringStore } from "@/store/Monitoring";

export default (message) => {
  const monitoringStore = useMonitoringStore();
  
  monitoringStore.createNewMessage({message})
};
