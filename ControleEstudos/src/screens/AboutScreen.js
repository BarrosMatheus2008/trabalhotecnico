import React from 'react';
import { View } from 'react-native';
import SobreAppSection from '../../SobreAppSection';

export default function AboutScreen({ onAcessarLogin, onIrCadastro }) {
  return (
    <View>
      <SobreAppSection onAcessarLogin={onAcessarLogin} onIrCadastro={onIrCadastro} />
    </View>
  );
}