const router = require("express").Router();
const {
  listMedicines,
  searchMedicineAvailability,
  updateInventory,
  listInventory,
  getLowStock,
  addInventory,
} = require("../controllers/medicine.controller");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/", listMedicines);
router.get("/availability", searchMedicineAvailability);
router.get("/inventory", listInventory);
router.get("/low-stock", getLowStock);
router.post("/inventory", addInventory);
router.patch("/inventory/:id", updateInventory);

module.exports = router;