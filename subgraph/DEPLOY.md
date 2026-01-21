# Clapswap Subgraph Deployment

## Prerequisites
Your deploy key: `51ac5e197445717e57ea1752e0b95537`

## Option 1: Deploy via The Graph Studio UI (RECOMMENDED)

Since the CLI authentication is having issues, the easiest way is to deploy through the web interface:

1. Go to https://thegraph.com/studio/subgraph/clapswap/
2. Click on "Upload" or "Deploy"
3. Upload the compiled `build` folder (zip it first if needed)
4. Or use the Studio's built-in deployment from your GitHub repo

## Option 2: Manual CLI Deployment

Run these commands in order:

```powershell
# Navigate to subgraph directory
cd C:\Users\emi\Desktop\blockchains\clapswap\subgraph

# Build the subgraph
npm run build

# Create the auth config directory
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.graph"

# Create config file with your deploy key
@"
{
  "deploy-key": "51ac5e197445717e57ea1752e0b95537"
}
"@ | Out-File -FilePath "$env:USERPROFILE\.graph\config.json" -Encoding utf8

# Deploy
npx graph deploy clapswap subgraph.yaml `
  --node https://api.studio.thegraph.com/deploy/ `
  --ipfs https://api.thegraph.com/ipfs/ `
  --deploy-key 51ac5e197445717e57ea1752e0b95537 `
  --version-label v0.0.1
```

## Option 3: Use Graph Studio Deploy Button

In The Graph Studio dashboard:
1. Click "DEPLOY"
2. Follow the instructions to connect your GitHub repo
3. It will auto-deploy from your repository

## Current Deployment Info

- **Subgraph Name**: clapswap
- **Network**: Flare Coston2
- **Factory Address**: 0xb18398735D57570394678934157D5Bfb2a3e2B37  
- **Start Block**: 26360000
- **IPFS Build Hash**: Qmbp3ncd84yxrJJKZ27hjcv31qm1ALoRFTDr16NgSbsDA8
