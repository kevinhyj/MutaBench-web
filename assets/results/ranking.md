# Few-shot：Protein、RNA、Protein–Protein 的 LLM / RF 排名

来源：General 论文 **Figure 2c、2e、2g（PDF 第 4 页）**。每个任务同时列出五种 LLM 与该面板显示的全部 RF 基线，再按支持集 order 分成两张排行榜。

## 统计口径

- 指标：assay 等权平均的 **Spearman ρ**，越高越好。
- **所有分数均为主图柱高估读，以 ≈ 标记**，保留两位小数；不是原始 Source Data 的精确均值。
- 排名按表中估读分数降序；估读同分暂列并列，不能据此认定真实均值相同或存在显著差异。
- **order≤1**：支持集含单突变实验标签；**order≤2**：在其基础上加入双突变标签。order 指支持集，不是 query 阶数。
- LLM 在上下文中使用标签；RF 在预训练表征或 One-hot 编码上拟合回归头。LLM 行本身没有接 RF。
- 五种 LLM 的完整输入与推理配置未充分披露，不能默认 evidence、thinking 和 token 预算全部相同。

| 任务 | Assay 数 | order≤1 标签数 | order≤2 标签数 | 每个 assay 的 query 数 |
|---|---:|---:|---:|---:|
| Protein | 64 | 32 | 64 | 250 |
| RNA | 27 | 14–32 | 46–64 | 250 |
| Protein–Protein | 14 | 24–32 | 56–64 | 250 |

## 1. Protein

来源：Figure 2c；64 个 assays。

### 1.1 order≤1：32 个单突变标签

| 估读排名 | 模型 / 方法 | 类型 | Spearman ρ |
|---:|---|---|---:|
| 1 | GPT 6.1 Sol | LLM | ≈0.71 |
| 2 | Gemini 4 Argon | LLM | ≈0.68 |
| 3 | Gemini 3.8 Flash | LLM | ≈0.60 |
| 4 | Deepseek V4.1 Flash | LLM | ≈0.58 |
| 5（并列） | VenusREM* + RF | RF | ≈0.53 |
| 5（并列） | ESM2 650M + RF | RF | ≈0.53 |
| 7 | Qwen 3.8 27B | LLM | ≈0.52 |
| 8 | ESM2 3B + RF | RF | ≈0.49 |
| 9 | ProSST + RF | RF | ≈0.46 |
| 10 | One-hot + RF | RF | ≈0.31 |

### 1.2 order≤2：32 个单突变 + 32 个双突变标签

| 估读排名 | 模型 / 方法 | 类型 | Spearman ρ |
|---:|---|---|---:|
| 1（并列） | Gemini 4 Argon | LLM | ≈0.75 |
| 1（并列） | GPT 6.1 Sol | LLM | ≈0.75 |
| 3 | Gemini 3.8 Flash | LLM | ≈0.68 |
| 4 | VenusREM* + RF | RF | ≈0.66 |
| 5 | Deepseek V4.1 Flash | LLM | ≈0.65 |
| 6 | ESM2 650M + RF | RF | ≈0.63 |
| 7（并列） | Qwen 3.8 27B | LLM | ≈0.60 |
| 7（并列） | ESM2 3B + RF | RF | ≈0.60 |
| 9 | ProSST + RF | RF | ≈0.59 |
| 10 | One-hot + RF | RF | ≈0.51 |

GPT 在单突变支持下大致领先；加入双突变后，GPT 与 Argon 接近，Flash 随后。VenusREM* 是图中最强 RF 基线，但与 Deepseek 的差距较小。

## 2. RNA

来源：Figure 2e；27 个 assays。该面板展示六种 RF 基线，包括 ViennaRNA。

### 2.1 order≤1：14–32 个单突变标签

| 估读排名 | 模型 / 方法 | 类型 | Spearman ρ |
|---:|---|---|---:|
| 1 | Gemini 4 Argon | LLM | ≈0.49 |
| 2 | GPT 6.1 Sol | LLM | ≈0.46 |
| 3 | Gemini 3.8 Flash | LLM | ≈0.41 |
| 4 | Deepseek V4.1 Flash | LLM | ≈0.37 |
| 5 | Qwen 3.8 27B | LLM | ≈0.33 |
| 6 | One-hot + RF | RF | ≈0.24 |
| 7 | RNAErnie + RF | RF | ≈0.19 |
| 8 | RNA-FM + RF | RF | ≈0.17 |
| 9 | Evo 2 + RF | RF | ≈0.16 |
| 10 | RiNALMo + RF | RF | ≈0.15 |
| 11 | ViennaRNA + RF | RF | ≈0.09 |

### 2.2 order≤2：原单突变标签 + 32 个双突变标签

| 估读排名 | 模型 / 方法 | 类型 | Spearman ρ |
|---:|---|---|---:|
| 1 | Gemini 4 Argon | LLM | ≈0.54 |
| 2 | GPT 6.1 Sol | LLM | ≈0.52 |
| 3 | Gemini 3.8 Flash | LLM | ≈0.47 |
| 4 | Deepseek V4.1 Flash | LLM | ≈0.43 |
| 5 | Qwen 3.8 27B | LLM | ≈0.37 |
| 6 | One-hot + RF | RF | ≈0.31 |
| 7 | RNA-FM + RF | RF | ≈0.23 |
| 8 | RNAErnie + RF | RF | ≈0.22 |
| 9 | RiNALMo + RF | RF | ≈0.20 |
| 10 | Evo 2 + RF | RF | ≈0.19 |
| 11 | ViennaRNA + RF | RF | ≈0.14 |

两种支持条件下，五种 LLM 的柱高均高于所显示的 RF 基线；Argon 大致第一、GPT 第二。One-hot 是图中最强 RF 基线。

## 3. Protein–Protein

来源：Figure 2g；14 个 assays，均来自 BindingGYM。

### 3.1 order≤1：24–32 个单突变标签

| 估读排名 | 模型 / 方法 | 类型 | Spearman ρ |
|---:|---|---|---:|
| 1 | Gemini 4 Argon | LLM | ≈0.52 |
| 2 | GPT 6.1 Sol | LLM | ≈0.49 |
| 3 | Deepseek V4.1 Flash | LLM | ≈0.40 |
| 4 | Gemini 3.8 Flash | LLM | ≈0.38 |
| 5 | Qwen 3.8 27B | LLM | ≈0.30 |
| 6 | VenusREM* + RF | RF | ≈0.26 |
| 7 | ProSST + RF | RF | ≈0.21 |
| 8 | ESM2 650M + RF | RF | ≈0.12 |
| 9 | One-hot + RF | RF | ≈0.11 |
| 10 | ESM2 3B + RF | RF | ≈0.10 |

### 3.2 order≤2：原单突变标签 + 32 个双突变标签

| 估读排名 | 模型 / 方法 | 类型 | Spearman ρ |
|---:|---|---|---:|
| 1（并列） | Gemini 4 Argon | LLM | ≈0.70 |
| 1（并列） | GPT 6.1 Sol | LLM | ≈0.70 |
| 3（并列） | Gemini 3.8 Flash | LLM | ≈0.59 |
| 3（并列） | Deepseek V4.1 Flash | LLM | ≈0.59 |
| 5 | Qwen 3.8 27B | LLM | ≈0.55 |
| 6（并列） | One-hot + RF | RF | ≈0.51 |
| 6（并列） | VenusREM* + RF | RF | ≈0.51 |
| 8 | ProSST + RF | RF | ≈0.45 |
| 9 | ESM2 650M + RF | RF | ≈0.38 |
| 10 | ESM2 3B + RF | RF | ≈0.33 |

单突变支持下 Argon 大致领先；加入双突变后，Argon 与 GPT 接近。Flash 与 Deepseek、One-hot RF 与 VenusREM* RF 的柱高分别接近，精确先后需原始均值确认。

## 说明

1. 本文件只使用主图的五种 LLM / RF 对比面板，没有将扩展图的 Gemini sequence/evidence 消融或 SVR 结果混入排名。
2. VenusREM* 是论文 Methods 描述的项目适配实现；主图简写为 VenusREM。它结合 ProSST 表征、PLM 和 MSA 特征，不能等同于官方原生 PPI 预测器。
3. Query 含混合突变阶数，不能把这里的结果称为严格的高阶外推排名。
4. Order≤2 同时增加了支持标签数量和支持突变阶数，不能将提升单独归因于更高阶信息。
5. 若要对相近方法给出精确名次及显著性，需要相应 Source Data 和逐 assay 结果。