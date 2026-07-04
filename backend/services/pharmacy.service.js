const pharmacyRepository = require('../repositories/pharmacy.repository');
const ApiError = require('../utils/apiError');

class PharmacyService {
  async getMedicines(query, page = 1, limit = 10) {
    const skip = (page - 1) * parseInt(limit);
    
    // Add logic to track expired medicines if filter exists
    if (query.isExpiring) {
      const now = new Date();
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);
      query.expiryDate = { $gte: now, $lte: in30Days };
      delete query.isExpiring;
    }

    if (query.isLowStock) {
      query.stock = { $lt: 20 }; // Threshold for low stock
      delete query.isLowStock;
    }

    const medicines = await pharmacyRepository.getMedicines(query, skip, parseInt(limit));
    const total = await pharmacyRepository.countMedicines(query);

    return { 
      medicines, 
      total, 
      page: parseInt(page), 
      totalPages: Math.ceil(total / limit) 
    };
  }

  async getMedicineById(id) {
    const medicine = await pharmacyRepository.getMedicineById(id);
    if (!medicine) throw new ApiError(404, 'Medicine not found');
    return medicine;
  }

  async createMedicine(data) {
    return await pharmacyRepository.createMedicine(data);
  }

  async updateMedicine(id, data) {
    const medicine = await pharmacyRepository.updateMedicine(id, data);
    if (!medicine) throw new ApiError(404, 'Medicine not found');
    return medicine;
  }

  async deleteMedicine(id) {
    const medicine = await pharmacyRepository.deleteMedicine(id);
    if (!medicine) throw new ApiError(404, 'Medicine not found');
    return medicine;
  }

  async getPrescriptions(query, page = 1, limit = 10) {
    const skip = (page - 1) * parseInt(limit);
    const prescriptions = await pharmacyRepository.getPrescriptions(query, skip, parseInt(limit));
    const total = await pharmacyRepository.countPrescriptions(query);

    return {
      prescriptions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
  }

  async dispenseMedicine(recordId, medicineId) {
    const record = await pharmacyRepository.getPrescriptionById(recordId);
    if (!record) throw new ApiError(404, 'Prescription record not found');

    const medPrescribed = record.medicines.id(medicineId);
    if (!medPrescribed) throw new ApiError(404, 'Prescribed medicine not found in EMR');

    if (medPrescribed.dispensed) {
      throw new ApiError(400, 'Medicine has already been dispensed');
    }

    // Attempt to locate in inventory
    const inventoryItem = await pharmacyRepository.getMedicineByName(medPrescribed.name);
    if (!inventoryItem) {
      throw new ApiError(404, `Medicine "${medPrescribed.name}" is not in the pharmacy inventory`);
    }

    // Calculate dosage/duration count
    let quantityToDeduct = 10; // Fallback
    try {
      const frequencyMatch = medPrescribed.frequency.match(/\d+/);
      const durationMatch = medPrescribed.duration.match(/\d+/);
      if (frequencyMatch && durationMatch) {
        quantityToDeduct = parseInt(frequencyMatch[0]) * parseInt(durationMatch[0]);
      } else if (durationMatch) {
        quantityToDeduct = parseInt(durationMatch[0]);
      }
    } catch (e) {
      quantityToDeduct = 10;
    }

    if (inventoryItem.stock < quantityToDeduct) {
      throw new ApiError(400, `Insufficient stock for "${medPrescribed.name}". Available: ${inventoryItem.stock}, Prescribed: ${quantityToDeduct}`);
    }

    // Deduct stock and mark as dispensed
    inventoryItem.stock -= quantityToDeduct;
    await inventoryItem.save();

    medPrescribed.dispensed = true;
    medPrescribed.dispensedAt = new Date();
    await record.save();

    return {
      success: true,
      message: `Successfully dispensed ${quantityToDeduct} units of ${inventoryItem.name}`,
      record
    };
  }
}

module.exports = new PharmacyService();
