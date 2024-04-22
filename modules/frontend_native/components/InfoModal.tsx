import { useEffect, useRef, useState } from "react";
import { Modal, View, StyleSheet, Animated, TouchableOpacity, Easing } from "react-native";
import { AppStyles } from "../constants/styles";
import { LinearGradient } from "expo-linear-gradient";
import Txt from "./Txt";
import Success_icon from "../assets/icons/save_success.svg";
import Fail_icon from "../assets/icons/save_fail.svg";
import { InfoType } from "../common/types";

export default function InfoModal(props: {
  result: boolean; //True = success, False = fail
  type: InfoType;
  text: string;
  unsetVisible: () => void;
  actionDuring?: () => void;
}) {
  const [modalVisible, setModalVisible] = useState(true);
  const bounceAnim = new Animated.Value(0);

  useEffect(() => {
    bounceAnim.setValue(-70);
    Animated.timing(bounceAnim, {
      toValue: 30,
      duration: 1000,
      easing: Easing.bounce,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    props.actionDuring && props.actionDuring();
    setTimeout(() => {
      setModalVisible(false);
      props.unsetVisible();
    }, 3000);
  }, []);

  const text_success = `${props.text} was successfully ${
    props.type == InfoType.SAVE ? "saved" : props.type == InfoType.DELETE ? "deleted" : "modified"
  }`;
  const text_error = `Error occured while ${
    props.type == InfoType.SAVE
      ? "saving"
      : props.type == InfoType.DELETE
      ? "deleting"
      : "modifying"
  } ${props.text.toLowerCase()}`;

  return (
    <Modal animationType="fade" transparent={true} visible={modalVisible}>
      <LinearGradient colors={["#001f6d98", "transparent"]} style={s.modal_container}>
        <Animated.View style={[s.modal_body, { top: bounceAnim }]}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 50,
              paddingVertical: 10,
            }}
          >
            {props.result == true ? (
              <Success_icon height={40} width={40} />
            ) : (
              <Fail_icon height={40} width={40} />
            )}
            <Txt style={{ marginLeft: 10, fontFamily: "Roboto-bold" }}>
              {props.result == true ? text_success : text_error}
            </Txt>
          </View>
          <View></View>
        </Animated.View>
      </LinearGradient>
    </Modal>
  );
}

const s = StyleSheet.create({
  modal_container: {
    flex: 1,
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },

  modal_body: {
    backgroundColor: AppStyles.color.elem_back,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
