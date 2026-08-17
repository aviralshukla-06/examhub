import express from "express";
import { getCountries, getStates, getUniversities } from "../controllers/geo.controller";

const router = express.Router();

router.get("/countries", getCountries);
router.get("/states", getStates);
router.get("/universities", getUniversities);

export default router;
