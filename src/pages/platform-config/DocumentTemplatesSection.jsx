import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Stack
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import CreateDocumentTemplateDialog from "../../components/platform-config/CreateDocumentTemplateDialog";
import DocumentTemplatesGrid from "../../components/platform-config/DocumentTemplatesGrid";
import UploadDocumentTemplateDialog from "../../components/platform-config/UploadDocumentTemplateDialog";
import DocumentTemplateCompileDialog from "../../components/platform-config/DocumentTemplateCompileDialog";
import documentTemplateRepository from "@/repositories/documentTemplateRepository";
import { incrementTemplateVersion } from "@/utils/documentTemplateUtils";
import { resolveDocumentTemplateDownloadUrl } from "@/utils/resolveDocumentTemplateDownloadUrl";

function DocumentTemplatesSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [templates, setTemplates] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [compileOpen, setCompileOpen] = useState(false);
  const [compileResult, setCompileResult] = useState(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const rows = await documentTemplateRepository.getTemplates();
      setTemplates(rows);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to load document templates."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleCreate = async (payload) => {
    try {
      setSaving(true);
      setErrorMessage("");
      await documentTemplateRepository.createTemplate(payload);
      setSuccessMessage("Document template created.");
      setCreateOpen(false);
      await loadTemplates();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to create document template."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file) => {
    if (!selectedTemplate?.templateId) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      await documentTemplateRepository.uploadDocument(
        selectedTemplate.templateId,
        file
      );
      setSuccessMessage("Template document uploaded.");
      setUploadOpen(false);
      setSelectedTemplate(null);
      await loadTemplates();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to upload template document."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUploadNewVersion = async (template) => {
    try {
      setSaving(true);
      setErrorMessage("");

      const nextVersion = incrementTemplateVersion(template.version);
      const created = await documentTemplateRepository.createTemplate({
        template_name: template.templateName,
        template_code: template.templateCode,
        document_category: template.documentCategory,
        version: nextVersion,
        effective_from: template.effectiveFrom || null
      });

      setSelectedTemplate(created);
      setUploadOpen(true);
      setSuccessMessage(`Draft version ${nextVersion} created. Upload the DOCX file.`);
      await loadTemplates();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to create a new template version."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = (template) => {
    const url = resolveDocumentTemplateDownloadUrl(template.templateId);

    if (!url) {
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleActivate = async (template) => {
    try {
      setSaving(true);
      setErrorMessage("");
      await documentTemplateRepository.activateTemplate(template.templateId);
      setSuccessMessage(`Version ${template.version} activated.`);
      await loadTemplates();
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to activate template version."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCompile = async (template) => {
    try {
      setSaving(true);
      setErrorMessage("");
      const result = await documentTemplateRepository.compileTemplate(
        template.templateId
      );
      setCompileResult(result);
      setCompileOpen(true);
      setSuccessMessage(`Template compiled — ${result.valid} valid, ${result.invalid} invalid.`);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to compile template."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ConfigPageHeader
        title="Document Templates"
        subtitle="Manage HR document template metadata and DOCX storage for future document generation."
        breadcrumbs={[
          { label: "Platform Configuration" },
          { label: "Document Templates" }
        ]}
        statusChip={
          <Chip
            label={`${templates.length} template${templates.length === 1 ? "" : "s"}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
        actions={
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          >
            Create Template
          </Button>
        }
      />

      {errorMessage ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      ) : null}

      {loading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        <DocumentTemplatesGrid
          templates={templates}
          onCreate={() => setCreateOpen(true)}
          onUpload={(template) => {
            setSelectedTemplate(template);
            setUploadOpen(true);
          }}
          onUploadNewVersion={handleUploadNewVersion}
          onDownload={handleDownload}
          onActivate={handleActivate}
          onCompile={handleCompile}
        />
      )}

      <CreateDocumentTemplateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={saving}
      />

      <UploadDocumentTemplateDialog
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onSubmit={handleUpload}
        loading={saving}
      />

      <DocumentTemplateCompileDialog
        open={compileOpen}
        onClose={() => {
          setCompileOpen(false);
          setCompileResult(null);
        }}
        result={compileResult}
      />
    </>
  );
}

export default DocumentTemplatesSection;
