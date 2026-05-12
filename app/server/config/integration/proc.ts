import { platform } from "node:os";

import { type } from "arktype";

import type { RuntimeApiClient } from "~/server/headscale/api/endpoints";
import log from "~/utils/log";

import { Integration } from "./abstract";
import {
  findHeadscaleServe,
  signalAndWaitHealthy,
  systemdRestartAndWaitHealthy,
} from "./proc-helper";

const configSchema = {
  full: type({
    enabled: "boolean",
    restart_method: '"systemd" | "signal" = "systemd"',
    systemd_service: 'string = "headscale.service"',
  }),

  partial: type({
    enabled: "boolean?",
    restart_method: '"systemd" | "signal"?',
    systemd_service: "string?",
  }).partial(),
};

export default class ProcIntegration extends Integration<typeof configSchema.full.infer> {
  private pid: number | undefined;

  get name() {
    return "Native Linux (/proc)";
  }

  static get configSchema() {
    return configSchema;
  }

  async isAvailable() {
    if (platform() !== "linux") {
      log.error("config", "/proc is only available on Linux");
      return false;
    }

    try {
      const result = await findHeadscaleServe();
      if (!result) {
        log.error("config", "Could not find headscale serve process");
        return false;
      }

      this.pid = result;
      log.info("config", "Found headscale serve (PID %d)", this.pid);
      return true;
    } catch (error) {
      log.error("config", "Failed to scan /proc: %s", error);
      return false;
    }
  }

  async onConfigChange(client: RuntimeApiClient) {
    if (this.context.restart_method === "systemd") {
      const restarted = await systemdRestartAndWaitHealthy(client, {
        service: this.context.systemd_service,
      });
      if (restarted) {
        this.pid = await findHeadscaleServe();
      }
      return;
    }

    if (!this.pid) return;

    await signalAndWaitHealthy(client, {
      pid: this.pid,
      signal: "SIGHUP",
    });
  }
}
