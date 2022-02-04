# Kubernetes

Some kubernetes/helm stuff in this folder, to set up the demo on a public domain backed by a kubernetes cluster.

## Kubernetes

In the root `.k8s` folder, some individual kubernetes deployment files are hosted.

## Helm

The subfolder `.k8s/solid-wm-demo` is a Helm Chart that can be installed with.

`helm upgrade --install --namespace solid-wm solid-wmp-demo .k8s/solid-wm-demo`

All variables are in the `.k8s/solid-wm-demo/values.yml` file.