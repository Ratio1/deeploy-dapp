# Services Documentation

This document describes the pre-configured services available for deployment on the Deeploy platform.

## Table of Contents

- [Overview](#overview)
- [Using Codex Skill](#using-codex-skill)
- [Available Services](#available-services)
  - [PostgreSQL](#postgresql)
  - [MySQL](#mysql)
  - [MongoDB](#mongodb)
  - [n8n](#n8n)
  - [VDO.Ninja](#vdoninja)
  - [Docker Registry](#docker-registry)
  - [GitLab](#gitlab)
- [Container Resource Tiers](#container-resource-tiers)
- [Service Configuration Reference](#service-configuration-reference)
  - [Plugin Signatures](#plugin-signatures)
  - [Tunnel Engines](#tunnel-engines)
- [Adding New Services](#adding-new-services)

---

## Overview

Services are pre-configured containerized applications that can be deployed with minimal setup. Each service includes:

- A Docker image
- Default port configuration
- Required user inputs (credentials, secrets)
- Persistent volume mappings
- Tunnel configuration for external access

Services are designed to be deployed quickly while still allowing customization through user inputs.

---

## Using Codex Skill

You can use Codex with the repository skill to create new services:

- Skill file: `.codex/skills/add-service/SKILL.md`
- Skill name: `add-service`

Example request in Codex:

```text
Use $add-service to add a new <SERVICE_NAME> service
```

The skill is designed to research official docs first, propose a full configuration, ask follow-up questions only for uncertain fields, and validate the result before finishing.

---

## Available Services

### PostgreSQL

**Relational database management system**

PostgreSQL is a powerful, open-source object-relational database system known for reliability, feature robustness, and performance.

| Property | Value |
|----------|-------|
| Image | `postgres:17` |
| Port | 5432 |
| Tunnel | ngrok |
| Data Volume | `/var/lib/postgresql/data` |

**Configuration:**

| Input | Description |
|-------|-------------|
| `POSTGRES_PASSWORD` | Password for the default postgres superuser account |

**Use Cases:**
- Web application backends
- Data warehousing
- Geospatial applications (with PostGIS)
- Financial systems requiring ACID compliance
- Any application requiring a reliable relational database

**Connection Example:**
```bash
psql -h <tunnel-url> -U postgres -d postgres
```

---

### MySQL

**Relational database management system**

MySQL is the world's most popular open-source relational database, known for its speed and reliability.

| Property | Value |
|----------|-------|
| Image | `mysql` |
| Port | 3306 |
| Tunnel | ngrok |
| Data Volume | `/var/lib/mysql` |

**Configuration:**

| Input | Description |
|-------|-------------|
| `MYSQL_ROOT_PASSWORD` | Password for the MySQL root administrator account |

**Use Cases:**
- Content management systems (WordPress, Drupal)
- E-commerce platforms
- Web applications
- Data logging and analytics
- Legacy application support

**Connection Example:**
```bash
mysql -h <tunnel-url> -u root -p
```

---

### MongoDB

**NoSQL database management system**

MongoDB is a document-oriented NoSQL database designed for scalability and developer agility.

| Property | Value |
|----------|-------|
| Image | `mongo` |
| Port | 27017 |
| Tunnel | ngrok |
| Data Volume | `/data/db` |

**Configuration:**

| Input | Description |
|-------|-------------|
| `MONGO_INITDB_ROOT_USERNAME` | Username for the MongoDB root administrator account |
| `MONGO_INITDB_ROOT_PASSWORD` | Password for the MongoDB root administrator account |

**Use Cases:**
- Real-time analytics
- Content management
- IoT data storage
- Mobile application backends
- Catalogs and inventory management
- Applications with rapidly changing schemas

**Connection Example:**
```bash
mongosh "mongodb://<username>:<password>@<tunnel-url>:27017"
```

---

### n8n

**Workflow automation platform**

n8n is a free and open-source workflow automation tool that allows you to connect various services and automate tasks.

| Property | Value |
|----------|-------|
| Image | `n8nio/n8n` |
| Port | 5678 |
| Tunnel | cloudflare |
| Data Volume | `/home/node/.n8n` |

**Configuration:**

| Input | Description |
|-------|-------------|
| `N8N_ENCRYPTION_KEY` | Secret key used to encrypt credentials stored in the database |

**Use Cases:**
- API integrations
- Data synchronization between services
- Automated notifications and alerts
- Lead processing and CRM automation
- Social media automation
- DevOps pipeline triggers
- Scheduled data backups

**Access:**
Open `https://<tunnel-url>` in your browser to access the n8n web interface.

**Features:**
- 400+ integrations
- Visual workflow builder
- Self-hosted (data stays with you)
- Webhook triggers
- Scheduled executions

---

### VDO.Ninja

**Peer-to-peer video streaming**

VDO.Ninja (formerly OBS.Ninja) brings remote cameras into OBS or other studio software via WebRTC.

| Property | Value |
|----------|-------|
| Image | `caddy:alpine` |
| Port | 80 |
| Tunnel | cloudflare |
| Plugin | WORKER_APP_RUNNER |

**Configuration:**

No user inputs required.

**Use Cases:**
- Live streaming production
- Remote guest interviews
- Multi-camera setups
- Video podcasting
- Virtual events
- Remote collaboration

**How It Works:**
This service deploys a self-hosted VDO.Ninja instance. The application is cloned from the official GitHub repository and served via Caddy web server.

**Access:**
Open `https://<tunnel-url>` in your browser to access VDO.Ninja.

---

### Docker Registry

**Private container image registry**

Docker Registry is a stateless, server-side application for storing and distributing Docker images.

| Property | Value |
|----------|-------|
| Image | `registry:2` |
| Port | 5000 |
| Tunnel | cloudflare |
| Data Volume | `/var/lib/registry` |

**Configuration:**

| Input | Description |
|-------|-------------|
| `REGISTRY_HTTP_SECRET` | Secret key for signing session state and securing upload operations |

**Use Cases:**
- Private image hosting
- CI/CD pipeline integration
- Air-gapped environments
- Image distribution for edge deployments
- Development and testing environments

**Usage:**

1. **Tag an image for your registry:**
   ```bash
   docker tag my-app:latest <tunnel-url>/my-app:latest
   ```

2. **Push an image:**
   ```bash
   docker push <tunnel-url>/my-app:latest
   ```

3. **Pull an image:**
   ```bash
   docker pull <tunnel-url>/my-app:latest
   ```

**API Endpoints:**

| Endpoint | Description |
|----------|-------------|
| `GET /v2/` | API version check (health check) |
| `GET /v2/_catalog` | List all repositories |
| `GET /v2/<name>/tags/list` | List tags for a repository |

**Note:** This is an API-only registry with no built-in web UI. For a UI, consider deploying a separate registry browser.

---

### GitLab

**Self-hosted Git repository and DevOps platform**

GitLab is a complete DevOps platform delivered as a single application, providing source code management, CI/CD, security, and more.

| Property | Value |
|----------|-------|
| Image | `gitlab/gitlab-ce:latest` |
| Port | 80 |
| Tunnel | cloudflare |
| Config Volume | `/etc/gitlab` |
| Logs Volume | `/var/log/gitlab` |
| Data Volume | `/var/opt/gitlab` |

**Configuration:**

| Input | Description |
|-------|-------------|
| `GITLAB_ROOT_PASSWORD` | Initial password for the root administrator account (minimum 8 characters) |
| `GITLAB_OMNIBUS_CONFIG` | **Required.** GitLab configuration string. Must include your tunnel URL. |

**Example Configuration:**
```
external_url 'https://your-tunnel-url.com'
```

> **Why is this required?** GitLab needs to know its external URL to correctly generate asset links, redirects, and clone URLs. Without this, you'll see a blank white page.

**Use Cases:**
- Self-hosted Git repositories
- CI/CD pipelines
- Code review and merge requests
- Issue tracking and project management
- Container registry (built-in)
- Wiki and documentation
- DevSecOps workflows

**Access:**
Open `https://<tunnel-url>` in your browser. Login with:
- Username: `root`
- Password: The password you configured

**Important Notes:**

1. **Resource Requirements**: GitLab is resource-intensive. **Minimum recommended: S_MED1 tier** (4GB+ RAM required, 8GB+ recommended for production).

2. **Initial Startup**: First boot can take 5-10 minutes while GitLab initializes its components.

3. **Built-in Features**:
   - Container Registry (port 5050)
   - Package Registry
   - Terraform state management
   - Kubernetes integration

4. **SSH Access**: Git SSH operations are not available through the tunnel. Use HTTPS for git operations:
   ```bash
   git clone https://<tunnel-url>/username/repo.git
   ```

**Features:**
- Unlimited private repositories
- Built-in CI/CD with GitLab Runner
- Code review tools
- Issue boards (Kanban)
- Time tracking
- Wikis per project
- Snippets
- Web IDE

---

## Container Resource Tiers

Services can be deployed on different resource tiers based on your requirements:

| Tier | Name | CPU Cores | RAM | Storage | Monthly Cost |
|------|------|-----------|-----|---------|--------------|
| Entry | S_ENTRY | 1 | 2 GB | 8 GB | $13.50 |
| Medium | S_MED1 | 3 | 12 GB | 48 GB | $69.00 |
| High | S_HIGH1 | 8 | 22 GB | 88 GB | $135.00 |

**Recommendations:**

- **S_ENTRY**: Development, testing, low-traffic applications
- **S_MED1**: Production workloads, medium-traffic applications
- **S_HIGH1**: High-performance requirements, large datasets, high-traffic applications

---

## Service Configuration Reference

### Plugin Signatures

| Signature | Description |
|-----------|-------------|
| `CONTAINER_APP_RUNNER` | Standard container deployment. The specified Docker image is pulled and run directly. |
| `WORKER_APP_RUNNER` | Worker-based deployment. Clones a repository and runs build commands before starting the container. |

### Tunnel Engines

| Engine | Protocol | Best For |
|--------|----------|----------|
| `cloudflare` | HTTPS only | Web applications, APIs, HTTP-based services |
| `ngrok` | TCP/UDP | Databases, non-HTTP protocols, raw TCP connections |

**When to use each:**

- **Cloudflare**: Web UIs, REST APIs, webhooks, any HTTP/HTTPS traffic
- **ngrok**: Database connections (PostgreSQL, MySQL, MongoDB), MQTT, custom TCP protocols

---

## Adding New Services

New services can be added using the interactive CLI tool:

```bash
npm run add-service
```

The tool will prompt you for:

1. **Basic Information**
   - Service name
   - Description
   - Docker image
   - Exposed port
   - Logo filename
   - Color theme

2. **Plugin Configuration**
   - Plugin signature (CONTAINER_APP_RUNNER or WORKER_APP_RUNNER)
   - Tunnel engine (cloudflare or ngrok)

3. **User Inputs**
   - Environment variable keys
   - Display labels
   - Descriptions and placeholder examples

4. **Optional Configuration**
   - Static environment variables
   - Dynamic environment variables
   - Build and run commands
   - Pipeline parameters
   - Plugin parameters

After completing the prompts, the service will be automatically added to `services.ts`.

### Service Logo

Place your service logo (SVG or PNG) in:
```
src/assets/services/<logo-filename>
```

### Validating Services

After adding a service, validate the configuration:

```bash
npm run validate-services
```
