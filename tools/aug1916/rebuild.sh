#!/bin/bash
# Rebuild the 1916 data from OCR TSV directories.
# Usage: rebuild.sh TAG A1_OCR TX_OCR A2_OCR   (A1 = IA vol I, TX = HathiTrust both vols, A2 = IA vol II)
# WORK = folder with keys2019.json, avenue_words.json, ia1/ ia2/ (IA text layers, one NNN.txt per page) and
# lo/lodict/es (LibreOffice Spanish); DIGITAL = the private 2019 entries (only for comparing definitions).
# Writes everything under $WORK/rb_TAG; the repo is not touched.
set -e
S=${WORK:?set WORK}; DIG=${DIGITAL:?set DIGITAL}
T=$(cd "$(dirname "$0")" && pwd)
TAG=$1; A1=$2; TX=$3; A2=$4
O=$S/rb_$TAG; mkdir -p $O; export LO_ES_DIR=$S/lo/lodict/es
AUG1=$T/augusta1916_entries.json
# HathiTrust pages renumbered to IA numbering (vol I +3, vol II +329)
mkdir -p $O/tx1 $O/tx2
for f in $A1/[0-9][0-9][0-9].tsv; do p=$((10#$(basename $f .tsv))); q=$(printf %03d $((p+3))); [ -f $TX/$q.tsv ] && cp $TX/$q.tsv $O/tx1/$(basename $f); done
for f in $A2/[0-9][0-9][0-9].tsv; do p=$((10#$(basename $f .tsv))); q=$(printf %03d $((p+329))); [ -f $TX/$q.tsv ] && cp $TX/$q.tsv $O/tx2/$(basename $f); done
python3 $T/vote.py $A1 $O/tx1 $O/v1ht $LO_ES_DIR $S/avenue_words.json $AUG1 --tsv-b
python3 $T/vote.py $O/v1ht $S/ia1 $O/v1 $LO_ES_DIR $S/avenue_words.json $AUG1
python3 $T/vote.py $A2 $O/tx2 $O/v2ht $LO_ES_DIR $S/avenue_words.json $AUG1 --tsv-b
python3 $T/vote.py $O/v2ht $S/ia2 $O/v2 $LO_ES_DIR $S/avenue_words.json $AUG1
# Supplement to vol I (HathiTrust pp. 320-332) as pages 901-913
for p in $(seq 320 332); do cp $TX/$p.tsv $O/v1/$((p+581)).tsv; done
cd $T
python3 split.py $O/v1 $O/raw.json
python3 split.py $O/v2 $O/raw2.json
python3 align.py $O/raw.json $S/keys2019.json $O/al.json
python3 build16.py $O/al.json $S/avenue_words.json $S/keys2019.json $O/e16.json
python3 confirm.py $O/e16.json $S/keys2019.json $DIG $O/e16c.json
python3 finish16.py $O/e16c.json $O
python3 build_es16.py $O/raw2.json $S/avenue_words.json $S/keys2019.json $O/augusta1916_entries.json $O/augusta1916_es.json
echo "rebuilt in $O"
