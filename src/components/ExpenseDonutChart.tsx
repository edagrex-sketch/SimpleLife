import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS } from '../utils/colors';

interface DonutSegment {
  value: number;
  color: string;
}

interface ExpenseDonutChartProps {
  segments: DonutSegment[];
  centerLabel?: string;
}

const SIZE = 150;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ExpenseDonutChart({ segments, centerLabel = 'Gastos' }: ExpenseDonutChartProps) {
  const totalValue = segments.reduce((s, seg) => s + seg.value, 0);
  let accumulated = 0;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <G rotation="-90" origin={`${SIZE / 2}, ${SIZE / 2}`}>
          {totalValue === 0 ? (
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={COLORS.surfaceTertiary}
              strokeWidth={STROKE}
              fill="transparent"
            />
          ) : (
            segments.map((segment, index) => {
              if (segment.value <= 0) return null;
              const segmentRatio = segment.value / totalValue;
              const dashArray = `${CIRCUMFERENCE * segmentRatio} ${CIRCUMFERENCE * (1 - segmentRatio)}`;
              const dashOffset = -CIRCUMFERENCE * (accumulated / totalValue);
              accumulated += segment.value;

              return (
                <Circle
                  key={index}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  stroke={segment.color}
                  strokeWidth={STROKE}
                  fill="transparent"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                />
              );
            })
          )}
        </G>
      </Svg>
      <View style={styles.centerContainer}>
        <Text style={styles.centerLabel}>{centerLabel}</Text>
        <Text style={styles.centerValue}>
          ${totalValue.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  centerValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
});
