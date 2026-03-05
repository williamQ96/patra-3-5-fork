# Patra-KG 仓库介绍

## 1. 这个项目是做什么的
`patra-kg` 是 Patra ModelCards 体系中的知识库组件，目标是把 AI/ML 模型在“训练-部署-使用”全生命周期的信息结构化存入图数据库（Neo4j），用于可追溯、可查询、可审计的模型治理。

核心对象是 **Model Card（模型卡）**，并围绕它关联：
- Datasheet（数据集说明）
- Model（模型实体与下载位置）
- Bias / XAI 分析
- Deployment（部署）
- Device（设备）
- User（用户）

## 2. 总体架构
仓库当前是一个典型的“三层结构”实现：
- 存储层：Neo4j（图数据库）
- 服务层：
  - REST API（Flask，默认 `:5002`）
  - MCP Server（FastMCP + SSE，默认 `:8050`）
- 领域层：
  - `ingester/` 负责写入与更新图数据
  - `reconstructor/` 负责从图中重建模型卡、检索、拼装 link headers

此外还支持可选的 OpenAI embedding（`ENABLE_MC_SIMILARITY=True`）来做模型版本相似性推断（`REVISION_OF`）。

## 3. 目录速览
- `rest_server/`：REST 服务入口与依赖（`server.py`）
- `mcp_server/`：MCP 服务入口（`main.py`）
- `ingester/`：图写入逻辑、Neo4j 查询封装、embedding
- `reconstructor/`：图查询与模型卡重建
- `parser/`：JSON 模型卡解析
- `kg_config/constraints.cypher`：Neo4j 约束、向量索引、全文索引
- `examples/`：示例 model cards / datasheets / 查询
- `docs/patra_openapi.json`：OpenAPI 定义
- `tests/`：REST 与 MCP 单元测试

## 4. 对外能力
### REST API（Flask）
主要能力包括：
- 上传/更新/读取模型卡
- 上传 datasheet
- 模型检索（全文搜索）
- 查询模型下载地址、部署信息
- 更新模型位置 URL
- 生成 PID
- 注册设备与用户
- 通过 `HEAD`/`linkset` 返回模型卡关系链接

### MCP Server（FastMCP）
- Resources：按 `modelcard://...` 读取模型卡、部署、下载地址、linkset
- Tools：上传/更新模型卡、上传 datasheet、搜索、列举、注册 device/user、创建边、更新位置等

适合让 AI Agent 直接调用知识图谱能力（SSE 连接）。

## 5. 在 codespace / 容器环境如何理解和跑起来
仓库没有专门的 `.devcontainer`，但可直接在 GitHub Codespaces 或任意容器化 Linux 环境运行。

推荐路径：
1. 准备 Docker + Docker Compose
2. 在仓库根目录执行 `make up`
3. 访问：
   - REST: `http://localhost:5002`（Swagger 在 `/swagger`）
   - MCP SSE: `http://localhost:8050/sse`
   - Neo4j Browser: `http://localhost:7474/browser/`

可选环境变量：
- `ENABLE_MC_SIMILARITY=True` + `OPENAI_API_KEY`（开启版本相似性）
- `HF_HUB_USERNAME/HF_HUB_TOKEN`（Hugging Face 凭证）
- `GH_HUB_USERNAME/GH_HUB_TOKEN`（GitHub 凭证）

## 6. 数据与索引设计（重点）
`kg_config/constraints.cypher` 中定义了：
- 唯一约束：`ModelCard.external_id`、`Model.model_id`、`Datasheet.external_id`、`Deployment.deployment_id`、`User.user_id`
- 向量索引：`modelEmbeddings`（300 维，cosine）
- 全文索引：`mcFullIndex`（name/description/keywords/author）

这意味着仓库既支持关键字检索，也支持向量相似度检索。

## 7. 测试与 CI
- CI 在 `.github/workflows/ci.yml`
- 使用 Python 3.11，执行 `pytest`
- REST 与 MCP 都有测试文件
- 测试中通过 stub/mocking 降低对真实外部服务的依赖

## 8. 当前仓库的注意点（阅读代码时建议先知道）
- `Makefile` 里使用的 Neo4j 容器名是 `patra_neo4j_server`，而 `docker-compose.yml` 里是 `neo4j_db`，直接 `make up` 可能需要先统一容器名。
- 部署关系在写入与读取处存在命名差异（例如写入 `Deployed_On` / `On_Device`，读取使用 `HAS_DEPLOYMENT` / `DEPLOYED_IN` / `DEPLOYMENT_INFO`），如果你要依赖部署查询，建议先对齐关系名。

## 9. 一句话总结
这是一个面向 AI/ML 模型治理的图谱后端：**用 Neo4j 承载模型卡知识，用 REST/MCP 双接口对外提供可编排、可查询、可追溯的模型生命周期服务**。
