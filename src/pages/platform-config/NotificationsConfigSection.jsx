import { useOutletContext } from "react-router-dom";

import { Chip } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import NotificationCommConsole from "../../components/platform-config/NotificationCommConsole";

function NotificationsConfigSection() {

  const {
    config,
    toggleNotificationChannel,
    updateNotificationSettings
  } = useOutletContext();

  const activeChannels = config.notification_channels.filter(
    (c) => c.enabled
  ).length;

  return (

    <>

      <ConfigPageHeader
        title="Communication management"
        subtitle="Delivery channels, templates, digest scheduling, quiet hours, and delivery policies."
        breadcrumbs={[
          { label: "Platform Configuration" },
          { label: "Notifications" }
        ]}
        statusChip={
          <Chip
            label={`${activeChannels} channels active`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <NotificationCommConsole
        channels={config.notification_channels}
        settings={config.notification_settings}
        onToggleChannel={toggleNotificationChannel}
        onUpdateSettings={updateNotificationSettings}
      />

    </>

  );

}

export default NotificationsConfigSection;
