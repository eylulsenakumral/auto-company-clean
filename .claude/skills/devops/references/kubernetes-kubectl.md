# kubectl Essential Commands

## Cluster & Node
```bash
kubectl cluster-info
kubectl get nodes
kubectl describe node <node-name>
kubectl top nodes
kubectl drain <node-name> --ignore-daemonsets
kubectl uncordon <node-name>
```

## Pod Operations
```bash
kubectl get pods -A                     # All namespaces
kubectl get pods -o wide                # Extended info
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl logs -f <pod-name>              # Follow
kubectl logs --previous <pod-name>      # Previous crash
kubectl exec -it <pod-name> -- /bin/bash
```

## Deployment
```bash
kubectl apply -f manifest.yaml
kubectl apply -f ./manifests/
kubectl apply -f manifest.yaml --dry-run***REMOVED***client -o yaml  # Preview
kubectl set image deployment/myapp app***REMOVED***myapp:v2
kubectl delete -f manifest.yaml
```

## Service & Network
```bash
kubectl port-forward service/myapp 8080:8080
kubectl get svc
kubectl exec -it <pod-name> -- curl http://service:8080
kubectl exec -it <pod-name> -- nslookup kubernetes.default
```

## Debugging (Get → Describe → Logs)
```bash
kubectl get pods -o wide
kubectl get events -n <ns> --sort-by***REMOVED***'.lastTimestamp'
kubectl describe pod <pod-name>
kubectl logs <pod-name> -c <container>
```

## Output & Filtering
```bash
kubectl get pods -o json
kubectl get pods -o yaml
kubectl get pods -l app***REMOVED***myapp,tier***REMOVED***frontend
kubectl get pods --field-selector***REMOVED***status.phase***REMOVED***Running
kubectl get pods -w                     # Watch
```

## Flags

| Flag | Purpose |
|------|---------|
| `-n` | Namespace |
| `-A` | All namespaces |
| `-o` | Output format |
| `-l` | Label selector |
| `-w` | Watch |

## Aliases
```bash
alias k***REMOVED***'kubectl'
alias kgp***REMOVED***'kubectl get pods'
alias kd***REMOVED***'kubectl describe'
alias kl***REMOVED***'kubectl logs'
```
