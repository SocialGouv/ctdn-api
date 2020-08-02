import { ok } from "assert";
import env from "@kosko/env";
import { Deployment } from "kubernetes-models/apps/v1/Deployment";
import { Container } from "kubernetes-models/v1/Container";
import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { IIoK8sApiCoreV1EnvVar } from "kubernetes-models/_definitions/IoK8sApiCoreV1EnvVar";

import { create } from "@socialgouv/kosko-charts/components/app";
import { addInitContainer } from "@socialgouv/kosko-charts/utils/addInitContainer";
import { addEnv } from "@socialgouv/kosko-charts/utils/addEnv";

const redisEnv: IIoK8sApiCoreV1EnvVar = {
  name: "REDIS_URL",
  value: "redis://redis:6379",
};

// create the main app container + service + ingress
const manifests = create("app", {
  env,
  config: {
    containerPort: 3000,
  },
  deployment: {
    container: {
      resources: {
        requests: {
          cpu: "5m",
          memory: "128Mi",
        },
        limits: {
          cpu: "1000m",
          memory: "256Mi",
        },
      },
    },
  },
});

// create an initContainre to feed REDIS
const initContainer = new Container({
  name: "init",
  image: `${process.env.CI_REGISTRY_IMAGE}/init:${process.env.CI_COMMIT_SHA}`,
  imagePullPolicy: "Always",
  resources: {
    requests: {
      cpu: "2000m",
      memory: "2Gi",
    },
    limits: {
      cpu: "2000m",
      memory: "2Gi",
    },
  },
  env: [redisEnv],
});

const deployment = manifests.find(
  (manifest: { kind: string }): manifest is Deployment => manifest.kind === "Deployment",
);
ok(deployment);

addEnv({ deployment, data: new EnvVar(redisEnv) });
addInitContainer(deployment, initContainer);

export default manifests;
