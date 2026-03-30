// src/admin/controllers/catalogue.controller.js
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import {
  adminListCatalogue,
  adminCreateCatalogue,
  adminUpdateCatalogue,
  adminDeleteCatalogue,
} from "../services/catalogue.service.js";

export const adminCatalogueListController = asyncHandler(async (req, res) => {
  const data = await adminListCatalogue({ query: req.validated.query });
  return ok(res, data, "Catalogue fetched");
});

export const adminCatalogueCreateController = asyncHandler(async (req, res) => {
  const data = await adminCreateCatalogue({
    req,
    input: req.validated.body,
    file: req.file,
  });
  return ok(res, data, data.msg);
});

export const adminCatalogueUpdateController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;

  const body = req.validated.body ?? {};
  const hasBodyFields = Object.keys(body).length > 0;
  const hasCatalogPdf = Boolean(req.file);

  if (!hasBodyFields && !hasCatalogPdf) {
    throw makeError(
      "At least one field or file must be provided",
      400,
      "ADMIN_CATALOGUE_UPDATE_EMPTY"
    );
  }

  const data = await adminUpdateCatalogue({
    req,
    id,
    input: body,
    file: req.file,
  });

  return ok(res, data, data.msg);
});

export const adminCatalogueDeleteController = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  const data = await adminDeleteCatalogue({ req, id });
  return ok(res, data, data.msg);
});
