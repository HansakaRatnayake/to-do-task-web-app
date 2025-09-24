import { Router } from "express";
import {
    findAllGenders,
    findGenderById,
} from "../controller/genderController";

const router = Router();

router.get("/list", findAllGenders);

router.get("/:id", findGenderById);

export default router;
