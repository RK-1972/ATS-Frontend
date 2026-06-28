import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost, httpPut, httpDelete } from "../httpClient";
import platformConfigMock from "@/data/mock/platformConfig.mock";
import { cloneData } from "@/utils/cloneData";

const notificationsClient = {

  getAll(currentData) {
    return httpGet(
      ENDPOINTS.notifications,
      () => cloneData({
        settings: currentData?.notification_settings
          || platformConfigMock.notification_settings,
        channels: currentData?.notification_channels
          || platformConfigMock.notification_channels
      })
    );
  },

  getById(key, currentData) {
    return httpGet(
      `${ENDPOINTS.notifications}/${key}`,
      () => {
        const channels = currentData?.notification_channels
          || platformConfigMock.notification_channels;
        return cloneData(channels.find((item) => item.key === key) || null);
      }
    );
  },

  create(channel) {
    return httpPost(ENDPOINTS.notifications, channel, () => cloneData(channel));
  },

  update(key, channel) {
    return httpPut(
      `${ENDPOINTS.notifications}/${key}`,
      channel,
      () => cloneData(channel)
    );
  },

  publish(settings) {
    return httpPost(
      `${ENDPOINTS.notifications}/publish`,
      settings,
      () => cloneData(settings)
    );
  },

  archive(key) {
    return httpPost(
      `${ENDPOINTS.notifications}/${key}/archive`,
      {},
      () => ({ key, archived: true })
    );
  },

  delete(key) {
    return httpDelete(
      `${ENDPOINTS.notifications}/${key}`,
      () => ({ key, deleted: true })
    );
  }

};

export default notificationsClient;
