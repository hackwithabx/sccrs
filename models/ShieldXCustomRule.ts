import mongoose, { Schema, model, models, Document } from "mongoose";

export type RuleType = "false-positive" | "false-negative" | "custom-check";

export interface IShieldXCustomRule extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  ruleType: RuleType;
  /** For false-positive: the finding ID to suppress (e.g. "sql-injection") */
  findingId?: string;
  /** Regex pattern to match against code — used for false-negative detection and custom checks */
  pattern?: string;
  /** Flags for regex (e.g. "gi") */
  patternFlags?: string;
  /** Severity assigned to matches */
  severity: "critical" | "high" | "medium" | "low" | "info";
  /** CWE reference */
  cwe?: string;
  /** OWASP reference */
  owasp?: string;
  /** Category for grouping */
  category?: string;
  /** Detail message shown when rule matches */
  message: string;
  /** Remediation advice */
  remediation?: string;
  /** Languages this rule applies to (empty = all) */
  languages: string[];
  /** Whether rule is active */
  enabled: boolean;
  /** Confidence level for matches */
  confidence: "high" | "medium" | "low";
  /** File path pattern (glob) to include/exclude */
  filePattern?: string;
  /** Line-based suppression: suppress finding only on specific lines matching this pattern */
  suppressPattern?: string;
  /** Description / notes */
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShieldXCustomRuleSchema = new Schema<IShieldXCustomRule>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, maxlength: 200 },
    ruleType: {
      type: String,
      enum: ["false-positive", "false-negative", "custom-check"],
      required: true,
    },
    findingId: { type: String, maxlength: 200 },
    pattern: { type: String, maxlength: 2000 },
    patternFlags: { type: String, maxlength: 10, default: "gi" },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      required: true,
      default: "medium",
    },
    cwe: { type: String, maxlength: 50 },
    owasp: { type: String, maxlength: 50 },
    category: { type: String, maxlength: 100, default: "Custom Rule" },
    message: { type: String, required: true, maxlength: 1000 },
    remediation: { type: String, maxlength: 2000 },
    languages: [{ type: String, enum: ["javascript", "typescript", "java", "cpp", "csharp"] }],
    enabled: { type: Boolean, default: true },
    confidence: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    filePattern: { type: String, maxlength: 500 },
    suppressPattern: { type: String, maxlength: 1000 },
    description: { type: String, maxlength: 2000 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

ShieldXCustomRuleSchema.index({ userId: 1, ruleType: 1 });
ShieldXCustomRuleSchema.index({ userId: 1, enabled: 1 });

export default models.ShieldXCustomRule ||
  model<IShieldXCustomRule>("ShieldXCustomRule", ShieldXCustomRuleSchema);
