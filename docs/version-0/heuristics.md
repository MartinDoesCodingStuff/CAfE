# Heuristics
This page explains the heuristics algorithm the format will use.

The encoder goes through the samples and applies an `atan2` calculation to both the sample and the one ahead of it. We then take the difference of each result and store it. The decoder detects if a group of samples is going in a straight line by tracking the deviation of each calculation. If it goes above a certain threshold, it declares that that group of samples are not going in a straight line anymore. Refer to the sample code at the bottom on how this works.


```js
var samps = get_samples();    // Assume get_samples returns a 32-bit signed integer array
var atan2_diff = [];         // Where we store the atan2 diffs
var offsets_not_a_line = [];  // Sample offsets
for(let i=0;i<samps.length;i++) {
  let diff = (Math.atan2(1,samps[i])-Math.atan2(1,samps[i+1]));
  atan2_diff.push(diff);
  if((i > 1) && ((atan2_diff[i] - atan2_diff[i + 1]) > TRESHOLD)) {
    offsets_not_a_line.push(i);
  }
}
```