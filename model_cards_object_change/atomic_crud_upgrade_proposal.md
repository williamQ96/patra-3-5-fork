# Patra Model Cards 升级方案（从单体 Schema 到原子化 CRUD）

## 0. TL;DR
当前 Patra 的 `modelcard` 仍是“单体对象一次性写入”，不利于：
1. 增量更新（只改某个节点）
2. 数据质量追踪（字段来源和置信度）
3. 可复现性与安全审计（字段粒度不够）

建议目标是：
- 以 `ModelCard / Model / Datasheet / TrainingRun / Evaluation / SecurityAssessment / ReproducibilityProfile` 为核心节点
- 每个节点独立 CRUD
- 通过受控边词汇（edge vocabulary）拼成完整生命周期图
- 新增可复现性字段与漏洞字段，支持论文中的可追溯与安全分析

---

## 1. 为什么要改（结合你给的指示）

### 1.1 现状问题（monolithic schema）
- 现有入口以 `/modelcard` 为中心，上传时把 `ai_model`、`bias_analysis`、`xai_analysis`、`model_requirements` 打包处理。
- 这种方式对“局部更新”不友好。例如只更新安全扫描结果，也要走整卡更新逻辑。
- 现有字段更偏“描述性 metadata”，缺少系统化的 reproducibility/security 结构。

### 1.2 Year 5 目标对 schema 的要求
根据 `proposal.md` 与你给的指示，Year 5 要求已经明确：
- Datasheet 一等公民
- 从 HF/GitHub 导入并增强 metadata
- 支持模型生命周期与衍生关系
- 支持用户自定义字段
- 需要面向 reproducibility + security/vulnerability 的字段

这与“原子化 CRUD + 可扩展节点设计”完全一致。

---

## 2. 从 AWS/HF 得到的可借鉴点

### 2.1 AWS（偏治理）
可直接借鉴：
- `risk_rating`、`explanations_for_risk_rating`
- `training_job_details`（训练数据、环境、超参、训练指标）
- `evaluation_details.metric_groups`（结构化评估结果）
- `custom_details`（可扩展字段）

价值：
- 强约束、可审计、可比较，适合企业与合规场景。

### 2.2 Hugging Face（偏透明与复现）
可直接借鉴：
- `Direct Use / Downstream Use / Out-of-Scope Use`
- `Bias, Risks, Limitations`
- `Training Data + Training Procedure + Hyperparameters`
- `Technical Specifications`
- `Environmental Impact`

价值：
- 对研究者与开发者非常实用，便于复现与负责任使用。

### 2.3 Patra 最优解
不是二选一，而是组合：
- AWS 风格的结构化治理字段（风险、评估、审计）
- HF 风格的透明说明字段（用途、限制、复现指南）

---

## 3. 目标图谱模型（原子节点）

## 3.1 核心节点（MVP）
1. `ModelCard`（治理与叙事中心）
2. `Model`（模型制品与技术规格）
3. `Datasheet`（数据集元数据）
4. `ModelRequirements`（运行/依赖要求）
5. `BiasAnalysis`
6. `ExplainabilityAnalysis`
7. `Deployment`
8. `Experiment`
9. `User`
10. `Device`

## 3.2 新增建议节点（解决 reproducibility/security）
1. `TrainingRun`
2. `EvaluationReport`
3. `ReproducibilityProfile`
4. `SecurityAssessment`
5. `EnvironmentalImpact`
6. `FieldProvenance`（可选，记录“字段来自哪里”）

Reasoning：
- 把“训练”“评估”“安全”从 `ModelCard` 拆出来，才能独立 CRUD + 独立时间线。
- 后续可做定期扫描/重评估（例如安全扫描每周跑一次，不应重写整个 model card）。

---

## 4. 节点字段设计（重点）

## 4.1 ModelCard（治理入口）
建议字段：
- `model_card_id`（唯一）
- `name`, `version`, `summary`, `description`
- `lifecycle_stage`（draft/reviewed/approved/deprecated）
- `intended_use`, `downstream_use`, `out_of_scope_use`（来自 HF）
- `risk_rating`, `risk_explanation`（来自 AWS）
- `bias_risks_limitations`, `recommendations`
- `owner`, `maintainers`, `contact`
- `license`, `citation`, `documentation_urls`, `tags`
- `source_system`（patra/hf/aws/github）
- `source_uri`, `source_last_synced_at`
- `custom_metadata`（KV 扩展）

Reasoning：
- 该节点保留“人类可读治理信息”，不承载过细训练细节。
- `source_*` 用于 Patra Watcher 同步追踪。

## 4.2 Model（模型制品）
建议字段：
- `model_id`（唯一）
- `artifact_uri`
- `artifact_sha256`, `artifact_size_bytes`
- `framework`, `framework_version`, `model_type`, `architecture`
- `base_model_id`（支持衍生关系）
- `task_type`, `inference_labels`
- `container_image`, `container_digest`
- `signature_verified`（布尔）

Reasoning：
- 产物身份与完整性需要独立建模，安全扫描和供应链验证依赖这些字段。

## 4.3 Datasheet（数据节点）
建议字段：
- `datasheet_id`（唯一）
- `name`, `version`, `description`, `source`, `license`, `doi`
- `download_url`, `snapshot_hash`（关键，保证复现）
- `target_variable`, `feature_schema`
- `splits`（train/val/test）
- `datapoints`, `missing_values`, `attribute_types`
- `sensitive_attributes`, `pii_presence`
- `known_limitations`

Reasoning：
- 数据快照哈希和敏感字段标记是复现与合规的关键。

## 4.4 TrainingRun（训练过程）
建议字段：
- `training_run_id`（唯一）
- `code_repo_url`, `code_commit_sha`, `training_script_path`
- `random_seed`, `deterministic_enabled`
- `objective_function`
- `hyperparameters`（结构化数组）
- `training_metrics`（结构化数组）
- `training_start_at`, `training_end_at`
- `training_environment`（OS、CUDA、Python、容器镜像）
- `hardware`（GPU/CPU/内存）
- `log_uri`, `checkpoint_uri`

Reasoning：
- 这是复现论文最重要的数据源，必须独立存档并可比较。

## 4.5 EvaluationReport（评估）
建议字段：
- `evaluation_id`（唯一）
- `name`, `evaluation_observation`
- `evaluation_dataset_id`
- `factors`（子群体/场景）
- `metric_groups`（借鉴 AWS）
- `result_summary`
- `pass_fail_criteria`, `status`
- `evaluation_job_uri`

Reasoning：
- 将“评估协议”和“评估结果”结构化，支持横向比较与时间追踪。

## 4.6 ReproducibilityProfile（可复现性）
建议字段：
- `repro_profile_id`
- `reproducibility_level`（none/partial/full）
- `artifact_rebuildable`（布尔）
- `dataset_snapshot_available`（布尔）
- `dependency_lockfile_available`（布尔）
- `end_to_end_script_available`（布尔）
- `reproduction_instructions`
- `last_reproduced_at`, `reproduced_by`
- `reproduction_success_rate`

Reasoning：
- 把“是否可复现”从口头描述变成可查询指标，直接服务论文实验。

## 4.7 SecurityAssessment（安全与漏洞）
建议字段：
- `security_assessment_id`
- `scan_timestamp`, `scanner_name`, `scanner_version`
- `sbom_uri`
- `critical_vuln_count`, `high_vuln_count`, `medium_vuln_count`, `low_vuln_count`
- `known_cves`（数组：`cve_id`, `package`, `affected_version`, `fixed_version`, `severity`, `status`）
- `dependency_risk_score`
- `model_artifact_tamper_check`（布尔）
- `container_image_signed`（布尔）
- `security_notes`, `mitigation_plan`

Reasoning：
- 这个节点允许“按时间多次扫描”，符合实际 DevSecOps 流程。
- CVE 维度可直接回答“某模型当前是否可安全部署”。

## 4.8 EnvironmentalImpact（可选但建议）
建议字段：
- `impact_id`
- `hardware_type`, `hours_used`, `cloud_provider`, `cloud_region`
- `co2_emitted_grams`
- `methodology`

Reasoning：
- 直接继承 HF 社区实践，适合研究与负责任 AI 叙事。

---

## 5. 受控边词汇（Edge Vocabulary）建议

建议统一大写蛇形命名，并在全仓库只保留一套关系名：
- `MODELCARD_DESCRIBES_MODEL` (`ModelCard -> Model`)
- `MODELCARD_TRAINS_ON_DATASET` (`ModelCard -> Datasheet`)
- `MODELCARD_HAS_REQUIREMENTS` (`ModelCard -> ModelRequirements`)
- `MODELCARD_HAS_BIAS_ANALYSIS` (`ModelCard -> BiasAnalysis`)
- `MODELCARD_HAS_XAI_ANALYSIS` (`ModelCard -> ExplainabilityAnalysis`)
- `MODEL_HAS_TRAINING_RUN` (`Model -> TrainingRun`)
- `MODEL_HAS_EVALUATION` (`Model -> EvaluationReport`)
- `MODEL_HAS_SECURITY_ASSESSMENT` (`Model -> SecurityAssessment`)
- `MODEL_HAS_REPRO_PROFILE` (`Model -> ReproducibilityProfile`)
- `MODEL_DEPLOYED_AS` (`Model -> Deployment`)
- `DEPLOYMENT_ON_DEVICE` (`Deployment -> Device`)
- `EXPERIMENT_USES_MODEL` (`Experiment -> Model`)
- `EXPERIMENT_RUNS_ON_DEVICE` (`Experiment -> Device`)
- `EXPERIMENT_SUBMITTED_BY` (`Experiment -> User`)
- `MODELCARD_REVISION_OF` (`ModelCard -> ModelCard`)
- `MODELCARD_TRANSFORMATIVE_USE_OF` (`ModelCard -> ModelCard`)

Reasoning：
- 目前仓库里部署关系名称存在不一致，受控词汇是必要前置工作。

---

## 6. API 形态（Atomic CRUD）建议

每类节点统一 REST 形态：
- `POST /<node_plural>` 创建
- `GET /<node_plural>/{id}` 读取
- `PATCH /<node_plural>/{id}` 局部更新
- `DELETE /<node_plural>/{id}` 软删除或归档
- `GET /<node_plural>?filters=...` 列表检索

重点新增：
- `/training-runs`
- `/evaluation-reports`
- `/security-assessments`
- `/reproducibility-profiles`
- `/edges`（显式创建边，使用受控词汇校验）

兼容策略：
- 保留 `/modelcard` 作为“聚合写接口”（内部拆分调用原子节点 API），用于平滑迁移。

---

## 7. 从现有单体 JSON 的迁移映射

以当前 Patra JSON 为例：
- 顶层字段 -> `ModelCard`
- `ai_model` -> `Model`
- `model_requirements` -> `ModelRequirements`
- `bias_analysis` -> `BiasAnalysis`
- `xai_analysis` -> `ExplainabilityAnalysis`
- 新增从外部补全：`TrainingRun / EvaluationReport / SecurityAssessment / ReproducibilityProfile`

迁移流程建议：
1. Schema freeze（先冻结字段与边词汇）
2. 写 migration script（老 JSON -> 多节点）
3. 双写期（新老接口并存）
4. 回填历史数据（examples + HF/ICICLE）
5. 切换读取路径到原子节点聚合

---

## 8. 导入 HF/AWS 时的数据质量与可追溯

建议给关键字段加 provenance 记录（可用独立节点或内嵌对象）：
- `source_type`（hf/aws/manual/llm_augmented）
- `source_uri`
- `source_excerpt`
- `extraction_method`（rule/llm/manual）
- `confidence_score`
- `verified_by_human`（布尔）
- `verified_at`

Reasoning：
- 这与 proposal 中的 “AI Confidence Score + source-text citations” 对齐。
- 后续可以直接统计“自动补全字段可信度”。

---

## 9. 可复现性与安全字段的优先级（建议迭代顺序）

## P0（第一阶段必须）
- `code_commit_sha`
- `dataset_snapshot_hash`
- `training_environment`（python/framework/cuda/container）
- `random_seed`
- `artifact_sha256`
- `critical/high vulnerability counts`

## P1（第二阶段）
- `sbom_uri`
- `known_cves[]`
- `reproducibility_level`
- `end_to_end_script_available`
- `evaluation pass/fail criteria`

## P2（第三阶段）
- `environmental impact`
- 进阶安全测试（如 prompt-injection robustness，若是 LLM）

---

## 10. 我建议你们先落地的最小可行版本（MVP）

第一批就做这 7 类原子节点：
1. `ModelCard`
2. `Model`
3. `Datasheet`
4. `TrainingRun`
5. `EvaluationReport`
6. `SecurityAssessment`
7. `ReproducibilityProfile`

这样已经能满足：
- 对 HF/AWS 字段的大部分映射
- 可复现性论文所需核心证据
- 安全/漏洞维度的查询与审计

---

## 11. 你这个阶段可以直接推进的产出

1. 冻结 node/edge vocabulary（1 周内）
2. 给每个 node 出 JSON Schema（先 P0 字段）
3. 定义原子 CRUD OpenAPI
4. 写 `monolithic -> atomic` 转换脚本
5. 先手工做 6 个 HF/ICICLE 对象，校验字段可用性

---

## 12. 结论
这次升级不只是“多加几个字段”，而是把 Patra 从“文档式模型卡存储”升级成“可持续演进的治理知识图谱系统”。

最关键的两个收益：
- 复现性：从 narrative 变成结构化证据
- 安全性：从静态描述变成可周期扫描、可追踪的漏洞资产
