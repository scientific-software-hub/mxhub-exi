class PuckValidator {
    checkSampleNames(sampleNames, proteinIds, proposalSamples) {
        const conflicts = [];
        const samples = sampleNames.map((name, i) => ({ name, proteinId: proteinIds[i] }));

        for (let i = 0; i < sampleNames.length; i++) {
            const sameSampleName = _.filter(samples, { name: samples[i].name, proteinId: samples[i].proteinId });
            if (sameSampleName.length > 1) {
                conflicts.push(sameSampleName[0].name);
                break;
            }
        }

        for (let i = 0; i < sampleNames.length; i++) {
            const conflict = _.find(proposalSamples, { BLSample_name: sampleNames[i], Protein_proteinId: proteinIds[i] });
            if (conflict) {
                conflicts.push(sampleNames[i]);
            }
        }

        return conflicts;
    }
}

window.PuckValidator = PuckValidator;
