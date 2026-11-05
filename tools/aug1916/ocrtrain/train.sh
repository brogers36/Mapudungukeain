#!/bin/bash
# Fine-tune Tesseract's Spanish LSTM model (tessdata_best) on corrected lines of Augusta (1916), adding the letters
# of his alphabet the stock model lacks (ŋ, ə and the others found in the ground truth).
# Usage: ./train.sh LINES_DIR TESSDATA_BEST_spa.traineddata RADICAL_STROKE.txt OUT_DIR [ITERATIONS]
# LINES_DIR holds NAME.png + NAME.gt.txt pairs (from the correction page's export, via export_gt.py).
set -e
L=$1; BEST=$2; RS=$3; OUT=$4; IT=${5:-3000}
mkdir -p "$OUT"; H=$(cd "$(dirname "$0")" && pwd)
python3 "$H/make_box.py" "$L"
ls "$L"/*.gt.txt | sed 's/\.gt\.txt$//' | shuf --random-source=<(yes) > "$OUT/all"
n=$(wc -l < "$OUT/all"); ne=$(( n / 10 )); [ $ne -lt 1 ] && ne=1
head -n $ne "$OUT/all" > "$OUT/eval_base"; tail -n +$((ne+1)) "$OUT/all" > "$OUT/train_base"
# one .lstmf per line
while read b; do [ -s "$b.lstmf" ] || tesseract "$b.png" "$b" --psm 13 lstm.train >/dev/null 2>&1; done < "$OUT/all"
sed 's/$/.lstmf/' "$OUT/train_base" > "$OUT/list.train"; sed 's/$/.lstmf/' "$OUT/eval_base" > "$OUT/list.eval"
# unicharset: Spanish's plus every character of the ground truth
combine_tessdata -u "$BEST" "$OUT/spa." >/dev/null
unicharset_extractor --output_unicharset "$OUT/gt.unicharset" --norm_mode 2 "$L"/*.box >/dev/null
merge_unicharsets "$OUT/spa.lstm-unicharset" "$OUT/gt.unicharset" "$OUT/aug.unicharset" >/dev/null
mkdir -p "$OUT/lang"; : > "$OUT/lang/aug.wordlist"; : > "$OUT/lang/aug.punc"; : > "$OUT/lang/aug.numbers"
combine_lang_model --input_unicharset "$OUT/aug.unicharset" --script_dir "$(dirname "$RS")" --lang aug --output_dir "$OUT/lang" >/dev/null
lstmtraining --continue_from "$OUT/spa.lstm" --old_traineddata "$BEST" --traineddata "$OUT/lang/aug/aug.traineddata" \
  --model_output "$OUT/aug" --train_listfile "$OUT/list.train" --eval_listfile "$OUT/list.eval" --max_iterations $IT \
  --learning_rate 0.0005 --target_error_rate 0.01 2>&1 | grep -E "At iteration|Finished|best|Eval" | tail -n 20
lstmtraining --stop_training --continue_from "$OUT/aug_checkpoint" --traineddata "$OUT/lang/aug/aug.traineddata" --model_output "$OUT/aug.traineddata"
echo "model: $OUT/aug.traineddata  (use: tesseract IMG OUT --tessdata-dir $OUT -l aug)"
