package com.farmsync.service;

import com.farmsync.model.SoilType;
import com.farmsync.repository.SoilTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SoilTypeService {

    @Autowired
    private SoilTypeRepository soilTypeRepository;

    public List<SoilType> findAll() {
        return soilTypeRepository.findAll();
    }

    public Optional<SoilType> findById(@org.springframework.lang.NonNull UUID id) {
        return soilTypeRepository.findById(id);
    }

    public Optional<SoilType> findByName(String name) {
        return soilTypeRepository.findByName(name);
    }
}
