class PuckValidator {
    checkSampleNames(sampleNames, proteinIds, proposalSamples) {
        const conflicts = [];
        const samples = sampleNames.map((name, i) => ({ name, proteinId: proteinIds[i] }));

        const duplicate = samples.find((s, _, arr) =>
            arr.filter(x => x.name === s.name && x.proteinId === s.proteinId).length > 1
        );
        if (duplicate) conflicts.push(duplicate.name);

        sampleNames.forEach((name, i) => {
            if (_.find(proposalSamples, { BLSample_name: name, Protein_proteinId: proteinIds[i] })) {
                conflicts.push(name);
            }
        });

        return conflicts;
    }
}

window.PuckValidator = PuckValidator;
