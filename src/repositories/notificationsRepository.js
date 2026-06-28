import { isLiveMode } from "@/api/config";
import notificationsClient from "@/api/clients/notificationsClient";
import platformConfigRepository from "@/repositories/platformConfigRepository";
import { cloneData } from "@/utils/cloneData";
async function getAll(platformConfig) {
  return notificationsClient.getAll(platformConfig);
}

async function getById(key, platformConfig) {
  return notificationsClient.getById(key, platformConfig);
}

function updateSettings(platformConfig, field, value) {

  if (isLiveMode()) {
    return platformConfigRepository.updateNotificationSettings(platformConfig, field, value);
  }

  return {
    ...platformConfig,
    notification_settings: {
      ...platformConfig.notification_settings,
      [field]: value
    }
  };

}
function toggleChannel(platformConfig, key) {

  if (isLiveMode()) {
    return platformConfigRepository.toggleNotificationChannel(platformConfig, key);
  }

  const previous = platformConfig.notification_channels.find(    (item) => item.key === key
  );

  const nextConfig = {
    ...platformConfig,
    notification_channels: platformConfig.notification_channels.map((item) =>
      item.key === key
        ? { ...item, enabled: !item.enabled }
        : item
    )
  };

  const updated = nextConfig.notification_channels.find((item) => item.key === key);

  return { config: nextConfig, previous, updated };

}

function publish(settings) {
  return cloneData(settings);
}

const notificationsRepository = {
  getAll,
  getById,
  create: updateSettings,
  update: updateSettings,
  publish,
  archive: publish,
  delete: publish,
  updateSettings,
  toggleChannel
};

export default notificationsRepository;
