import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Linking,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// Question database organized by topic
const QUESTIONS_DB = {
  'Stress': [
    { id: 'M1', text: 'A pedestal has a triangular cross section. If it is subjected to a compressive force P of 500 lb, specify the x and y coordinates for the location of point P(x, y), where the load must be applied on the cross section, so that the average normal stress is uniform. Compute the stress. Vertices of the triangular cross section: Vertex 1: (0 in., 0 in.), Vertex 2: (0 in., 9 in.), Vertex 3: (12 in., 3 in.)\nAns. x = 4in, y = 4in, stress = 9.26psi' },
    { id: 'M2', text: 'A metal rod specimen failed in a tension test at an angle of 52 degrees (to the longitudinal axis) when the axial load was 19.80 kip. If the diameter of the specimen is 0.5 in., determine the average normal and average shear stress acting on the area of the inclined failure plane. Also, what is the average normal stress acting on the cross section when failure occurs?\nAns. Average normal stress on cross section: 100.9 ksi, Average normal stress on inclined failure plane: 62.7 ksi, Average shear stress on inclined failure plane: 48.9 ksi' },
    { id: 'M3', text: 'Rods AB and BC have diameters of 4 mm and 6 mm, respectively. The geometry: Point A: Pin support on left, Point B: Ring connection where both rods meet, Point C: Pin support on right, Rod AB: Horizontal, connects A to B, Rod BC: Inclined at theta = 60 degrees above horizontal, connects B to C. If a vertical downwards load of 8 kN is applied to the ring at B, determine the average normal stress in each rod if theta = 60 degrees.\nAns. AB = 368MPa, BC = 327MPa' },
    { id: 'M4', text: 'The bars of the truss each have a cross-sectional area of 1.25 in squared. Geometry: Joint A: (0 ft, 0 ft), Joint B: (4 ft, 3 ft), Joint C: (8 ft, 3 ft), Joint E: (4 ft, 0 ft), Joint D: (8 ft, 0 ft), Joint C: Pinned to wall, Joint D: Pinned to wall. Members: AB, AE, ED, EB, BC, BD. Force P = 8 kip acting downward at joint A, Force 0.75P = 6 kip acting downward at joint E. Determine the average normal stress in each member due to the loading P = 8 kip. State whether the stress is tensile (T) or compressive (C).\nAns. AB=10.7ksi T, AE=8.53ksi C, ED=8.53ksi C, EB=4.8ksi T, BC=23.5ksi T, BD=18.7ksi C' },
    { id: 'M5', text: 'A beam and hanger assembly is used to support a distributed loading of w = 0.8 kip/ft. Beam: Pinned to the wall at C (0, 0ft) and extends horizontal for 6ft. Hanger rod AB: Pinned to the wall at B (0, 3ft) and connected to the beam with a bolt at A (4, 0ft). Uniformly distributed load w = 0.8 kip/ft acting downward over the 6 ft beam length. Determine the average shear stress in the 0.40 in. diameter bolt at A and the average tensile stress in rod AB, which has a diameter of 0.5 in. If the yield shear stress for the bolt is 25 ksi, and the yield tensile stress for the rod is 38 ksi, determine the factor of safety with respect to yielding in each case.\nAns. Bolt: shear stress=23.9ksi, FOS=1.05. Rod: stress=30.6ksi, FOS=1.24' },
    { id: 'M6', text: 'A rod BC is made of steel having an allowable tensile stress of 155 MPa and supports the left end of beam AB. Joint A: (4.5, 0 m) right end, pinned support, Joint B: (0, 0 m) left end, connection point on beam for rod BC, Joint C: Above point B, upper connection of rod to support. Distributed downwards load increases from zero at B to w = 15 kN/m at (3, 0m) then decreases to zero at A. Determine its smallest diameter so that it can support the load.\nAns. 11.1 mm' },
  ],
  'Strain': [
    { id: 'M7', text: 'A thin strip of rubber has an unstretched length of 15 in. If it is stretched around a pipe having an outer diameter of 5 in., determine the average normal strain in the strip.\nAns. 0.0472 in/in' },
    { id: 'M8', text: 'A bar CA has length L m and is supported at its right end A by a wire AB. At the left end the bar is attached to a wall by a pin at C. The wire is attached to the wall at B which is L m vertically above C. When the wire AB is unstretched it makes an angle of theta = 45 degrees below the horizontal at B. If a load is applied to the bar AC which causes the angle to change to theta = 47 degrees, determine the normal strain in the wire.\nAns. 0.0343 m/m' },
    { id: 'M9', text: 'Two wires are connected together at A with a ring. Wire CA: Connects C to A, length = 300 mm, oriented at 30 degrees above horizontal (measured from horizontal at A). Wire BA: Connects B to A, length = 300 mm, oriented at 30 degrees below horizontal (measured from horizontal at A). B and C are connections to a wall and C is vertically above B. A horizontal force P is applied at A. If the force P causes point A to be displaced horizontally 2 mm away from the wall, determine the normal strain developed in each wire.\nAns. Strain in both wires = 0.0058 mm/mm' },
    { id: 'M10', text: 'A right-angled triangular plate ABC has vertices: A (0, 0mm), B (0, 800mm), C (800, 0mm). Edge BC is fixed, and its apex A is given a displacement of 5 mm in the direction perpendicular to edge BC. Determine the shear strain at A.\nAns. 0.0088 rad' },
    { id: 'M11', text: 'A rectangular plastic block is glued at its top and bottom to rigid plates. Point A: Bottom-left corner (0, 0). Point D: Bottom-right corner. Point B: Top-left corner (0, 2in). Point C: Top-right corner. A horizontal force P is applied to the top plate in the positive x direction, and causes the material to deform so that its sides are described by the equation y = 3.56x^(1/4). Determine the shear strain in the material at its corners A and B.\nAns. A = 0, B = 0.199 rad' },
  ],
  'Mechanical properties': [
    { id: 'M12', text: 'The stress - strain diagram for an elastic fibre has coordinates: (0 in/in, 0 psi), (2 in/in, 11 psi), (2.25 in/in, 55 psi). Determine the modulus of elasticity and estimate the modulus of toughness and modulus of resilience.\nAns. modulus of elasticity = 5.5psi, modulus of toughness = 19.25psi, modulus of resilience = 11 psi' },
    { id: 'M13', text: 'The stress-strain (s-e) diagram for a bone is described by the equation e = 0.45(10^-6)s + 0.36(10^-12)s^3, where s is in kPa. Determine the modulus of toughness and the amount of elongation of a 200 mm long region just before it fractures if failure occurs at e = 0.12 mm/mm.\nAns. 613MPa, 24mm' },
    { id: 'M14', text: 'A specimen is originally 1 ft long, has a diameter of 0.5 in., and is subjected to a force of 500 lb. When the force is increased to 1800 lb, the specimen elongates 0.9 in. Determine the modulus of elasticity for the material if it remains elastic.\nAns. 88.3ksi' },
    { id: 'M15', text: 'A bar BC has length 10 ft and is supported at its right end B by a wire AB with diameter 0.2 in made of A-36 steel. At the left end the bar is attached to a wall by a pin at C. The wire is attached to the wall at A which is vertically above C. Wire AB makes an angle of 30 degrees above the horizontal at B. A downwards uniformly distributed load is applied to the full length of the rod BC. Determine the magnitude of the distributed load if the end B is displaced by 0.75 in downwards.\nAns. 0.246kip/ft' },
    { id: 'M16', text: 'An aluminum block has a rectangular cross section and is subjected to an axial compressive force of 8 kip. If the 1.5 in. side changed its length to 1.500132 in., determine Poisson\'s ratio and the new length of the 2 in. side. The modulus of elasticity is 10(10^3) ksi.\nAns. Poissons ratio = 0.33, side length = 2.00018 in' },
    { id: 'M17', text: 'An 8 mm diameter brass rod has a modulus of elasticity of 100 GPa. If it is 3 m long and subjected to an axial load of 2 kN, determine its elongation. What is its elongation under the same load if its diameter is 6 mm?\nAns. For 8mm diameter = 1.19mm, for 6mm diameter = 2.12m' },
  ],
  'Axial load': [
    { id: 'M18', text: 'An assembly consists of a steel rod CB of length 3 m and an aluminum rod BA of length 2 m, each having a diameter of 12 mm. The rod is fixed at C and free at A and is subjected to axial loadings at A and at B: 6 kN acting at B in the negative x-direction, 18 kN acting at end A in the positive x-direction. Determine the displacement at the free end A. Modulus of elasticity (steel) is 200 GPa and Modulus of elasticity (aluminum) is 70 GPa.\nAns. 6.14mm' },
    { id: 'M19', text: 'A truss is made of three A-36 steel members AB, BC and CA, each having a cross-sectional area of 400 mm squared. Joint A: (0 m, 0 m), Joint C: (1.4 m, 0 m), Joint B: (0.8 m, 0.8 m). Joint A is pinned and joint C is a roller. Forces: Force P acting downward at joint B, force 5 kN acting horizontally to the right at joint B. Determine the magnitude P required to displace the roller to the right 0.2 mm.\nAns. 21.7kN' },
    { id: 'M20', text: 'A linkage is made of three pin-connected A-36 steel members DA, CA and AB, each having a cross-sectional area of 0.730 in squared. Joint D: (0 ft, 0 ft), Joint C: (6 ft, 0 ft), Joint A: (3 ft, -4 ft), Joint B: (3 ft, -10 ft). Joints C and D are pinned. A vertical force of P = 50 kip is applied to the end B of member AB. Determine the vertical displacement of point B.\nAns. 0.281in' },
    { id: 'M21', text: 'A 500 mm long steel pipe is filled with concrete and subjected to a compressive force of 80 kN. The steel pipe outer diameter is 80 mm and inner diameter is 70 mm. Modulus of elasticity (steel) is 200 GPa, Modulus of elasticity (concrete) is 24 GPa. Determine the stress in the concrete and the steel due to this loading.\nAns. steel stress = 48.8MPa, concrete stress = 5.85MPa' },
    { id: 'M22', text: 'A 10 mm diameter steel bolt is surrounded by a bronze sleeve. The outer diameter of this sleeve is 20 mm, and its inner diameter is 10 mm. The assembly is subjected to a compressive load P. The yield stress for the steel is 640 MPa and the bronze is 520 MPa. Modulus of elasticity (steel) is 200 GPa, Modulus of elasticity (bronze) is 100 GPa. Determine the magnitude of the largest elastic load P that can be applied to the assembly.\nAns. 126kN' },
    { id: 'M23', text: 'A tapered member is fixed connected at its ends A and B and is subjected to a downwards load P. The member is 2 in thick and 60 in long. The height tapers linearly from 6 in at A to 3 in at B. Determine the distance from A of the load position and its greatest magnitude, if the allowable normal stress for the material is 4 ksi.\nAns. 28.9in, 60.4kip' },
    { id: 'M24', text: 'A post is made from 6061-T6 aluminum and has a diameter of 50 mm and length 0.5 m. It is fixed supported at A and B and at its center C there is a coiled spring with stiffness 200 MN/m attached to a rigid collar. If the spring is originally uncompressed, determine the compression of the spring when a load of P = 50 kN is applied to the collar at C.\nAns. 0.039mm' },
    { id: 'M25', text: 'A thermo gate consists of two 6061-T6 aluminum plates that have a width of 15 mm and are fixed supported at their ends. One plate is 600 mm length, the other is 400 mm length, and both plates have thickness 10 mm. If the gap between them is 1.5 mm when the temperature is 25 degrees C, determine the temperature required to just close the gap. The coefficient of thermal expansion is 24(10^-6)/degrees C.\nAns. 87.5 degrees C' },
    { id: 'M26', text: 'A member is to be made from a steel plate that is 0.25 in thick. If a 1 in hole is drilled through its center, determine the approximate width of the plate so that it can support an axial force of 3350 lb. The allowable stress is 22 ksi.\nAns. 2.49in' },
    { id: 'M27', text: 'A 0.25 in diameter steel rivet having a temperature of 1500 degrees F is secured between two plates such that at this temperature it is 2 in long and exerts a clamping force of 250 lb between the plates. Determine the approximate clamping force between the plates when the rivet cools to 70 degrees F. Assume that the heads of the rivet and the plates are rigid and use a coefficient of thermal expansion of 8(10^-6)/degrees F, and modulus of elasticity of 29(10^3) ksi.\nAns. 16.5kip' },
  ],
  'Torsion': [
    { id: 'M28', text: 'A copper pipe has outer diameter 40 mm and inner diameter 37 mm. It is fixed at a wall at A and the axis is the longitudinal axis, positive away from the wall. Three torques are applied, sequentially moving away from the wall: -30 Nm, 20 Nm then -80 Nm. Determine the maximum shear stress in the pipe.\nAns. 26.7MPa' },
    { id: 'M29', text: 'A steel tube having an outer diameter of 2.5 in. is used to transmit 350 hp when turning at 27 rev/min. Determine the inner diameter of the tube if the allowable shear stress is 10 ksi.\nAns. 2.48in' },
    { id: 'M30', text: 'Two steel 20 mm diameter steel shafts are connected using a brass coupling. If the yield point for the steel is 100 MPa and for the brass is 250 MPa, determine the required outer diameter of the coupling so that the steel and brass begin to yield at the same time when the assembly is subjected to a torque T. Assume that the coupling has an inner diameter of 20 mm.\nAns. 21.9mm' },
    { id: 'M31', text: 'The drive shaft of an automobile is made of a steel having an allowable shear stress of 8 ksi. If the outer diameter of the shaft is 2.5 in. and the engine delivers 200 hp to the shaft when it is turning at 1140 rev/min, determine the minimum required thickness of the shaft\'s wall.\nAns. 0.174in' },
    { id: 'M32', text: 'A 0.75 in. diameter shaft for an electric motor develops 0.5 hp and runs at 1740 rev/min. Determine the torque produced and compute the maximum shear stress in the shaft. The shaft is 6 in long and supported by ball bearings at its ends.\nAns. 1.51lbft, 219psi' },
    { id: 'M33', text: 'The propellers of a ship are connected to an A-36 steel shaft that is 60 m long and has an outer diameter of 340 mm and inner diameter of 260 mm. If the power output is 4.5 MW when the shaft rotates at 20 rad/s, determine the maximum torsional stress in the shaft and its angle of twist.\nAns. 44.3MPa, 0.2085rad' },
    { id: 'M34', text: 'An 8 mm diameter A-36 bolt is screwed tightly into a block at A with a wrench. The wrench is a rigid bar that extends 150 mm each side, such that the force couple is separated by 300 mm. The wrench connects to the top of the bolt which is located 80 mm above the block at A. Determine the couple forces F that should be applied to the wrench so that the maximum shear stress in the bolt becomes 18 MPa. Also, compute the corresponding displacement of each force F needed to cause this stress.\nAns. 6.03N, 0.72mm' },
    { id: 'M35', text: 'A turbine and shaft is arranged as follows: Point B: Turbine connection (x = 0), Point C: First gear location (x = 3 m), Point D: Second gear location (x = 7 m), Point E: Journal bearing (x = 9 m). The turbine develops 150 kW of power, which is transmitted to the gears such that C receives 70 percent and D receives 30 percent. If the rotation of the 100 mm diameter A-36 steel shaft is 800 rev/min., determine the absolute maximum shear stress in the shaft and the angle of twist of end E of the shaft relative to B. The journal bearing at E allows the shaft to turn freely about its axis.\nAns. 9.12MPa, 0.0102rad' },
    { id: 'M36', text: 'An A-36 bolt is tightened within a hole such that the reactive torque on the shank AB can be expressed by the equation t = (kx squared) N.m/m, where x is in meters. If a torque of 50 N.m is applied to the bolt head, determine the constant k and the amount of twist in the 50 mm length of the shank. Assume the shank has a constant radius of 4 mm.\nAns. 1.2(10^6)N/m^2, 0.0622rad' },
  ],
  'Bending': [
    { id: 'M37', text: 'A beam AB has the following features: Point A: Left bearing support (x = 0), Downwards load of 800 N at x = 125 mm, Downwards load of 800 N at x = 725 mm, Point B: Right bearing support (x = 800 mm). The bearings at A and B exert only vertical reactions on the shaft. Express the shear and moment in the shaft as a function of x within the region 125 mm < x < 725 mm.\nAns. V = 15.6N, M = 15.6x + 100 Nm' },
    { id: 'M38', text: 'A solid rectangular member has dimensions of 12 in and 6 in and is to be used to resist an internal bending moment of 2 kip.ft. Determine the maximum stress in the member if the moment is applied (a) about the x axis, (b) about the y axis. The larger dimension is aligned with the y axis.\nAns. Stress x = 167psi, stress y = 333psi' },
    { id: 'M39', text: 'A steel I-section has flanges 6 in wide and a web 6 in deep, both 0.25 in thick, such that the total depth is 6.5 in. The allowable stress of the steel is 24 ksi. Determine the largest moment the section can resist if the moment is applied (a) about the x axis, (b) about the y axis. The web is aligned with the y axis and the section is symmetric about the x and y axes.\nAns. Mx = 20.8 kip.ft, My = 6 kip.ft' },
    { id: 'M40', text: 'An unequal flange I-section has a top flange 5 in wide, bottom flange 3 in wide and web 8 in deep. All elements are 1 in thick, such that the section is 10 in deep. The web is aligned with the y axis and the section is symmetric about the y axis. The section is subjected to a moment of 15 kip.ft. Determine the resultant forces from the bending stresses in the top and bottom flanges.\nAns. Force top = 17.7kip, Force bottom = 13.7kip' },
    { id: 'M41', text: 'A beam AB has the following features: Point A: Left bearing support (x = 0), Downwards load of 800 N at x = 125 mm, Downwards load of 800 N at x = 725 mm, Point B: Right bearing support (x = 800 mm). The bearings at A and B exert only vertical reactions on the shaft. The cross-section is solid circular with a diameter of 50 mm. Determine the maximum stress in the beam.\nAns. 9.05MPa' },
    { id: 'M42', text: 'A 4.5 m beam rests on supports that are 1.5 m apart, and has 1.5 m overhangs on both sides of these supports. Loads are P acting downward at left end (x = 0) and P acting downward at right end (x = 4.5 m). The beam has a rectangular cross section 150 mm wide and 250 mm deep. Determine the largest load P that can be supported on its overhanging ends so that the bending stress does not exceed 10 MPa.\nAns. P = 10.4kN' },
    { id: 'M43', text: 'A wood beam is reinforced with bonded steel plates at its top and bottom, with dimensions: wood core 200 mm wide and 300 mm deep, steel plates both 200 mm wide and 20 mm thick. Determine the maximum bending stress developed in the wood and steel if the beam is subjected to a bending moment of M = 5 kN.m. Modulus of elasticity (wood) is 11 GPa, Modulus of elasticity (steel) is 200 GPa.\nAns. stress wood = 3.26MPa, stress steel = 3.7MPa' },
    { id: 'M44', text: 'A T-section has a top flange 8 in wide and a web 10 in deep, both elements are 2 in thick, such that the total depth is 12 in. Determine the plastic section modulus and the shape factor about the neutral axis parallel to the flange.\nAns. modulus = 114 in^3, shape factor = 1.78' },
    { id: 'M45', text: 'A 20 ft long beam is subjected to a downwards uniformly distributed load W over its full length. It is made of an elastic-plastic material with a yield stress of 30 ksi, and has a solid square cross-section that is 8 in x 8 in. Determine the load W which causes the maximum moment to be (a) the largest elastic moment (b) the largest plastic moment.\nAns. elastic = 4.27kip/ft, plastic = 6.4kip/ft' },
    { id: 'M46', text: 'A 16 ft long reinforced concrete beam is pinned at the left and rests on a roller at the mid-length. A downwards uniformly distributed load W acts over its full length. The cross-section is rectangular, 10 in wide and 20 in deep. Two 0.75 in diameter steel reinforcing bars are located 2.5 in below the top surface. Determine the maximum uniformly distributed load W that can be supported by the beam if the allowable tensile stress for the steel is 28 ksi, and the allowable compressive stress for the concrete is 3 ksi. Assume the concrete cannot support a tensile stress. Modulus of elasticity (steel) is 29(10^3) ksi, Modulus of elasticity (concrete) is 3.6(10^3) ksi.\nAns. 1.03kip/ft' },
  ],
  'Transverse shear': [
    { id: 'M47', text: 'A T section has a flange 14 in wide and 3 in thick, and a web 6 in deep and 6 in thick. The overall depth is 9 in and the section is symmetric about the vertical axis. The section is subjected to a vertical shear of 10 kip, determine the maximum shear stress in the beam. Also, compute the shear-stress jump at the flange-web junction AB.\nAns. Max stress = 276 psi, stress jump = 156 psi' },
    { id: 'M48', text: 'A T section has a flange 14 in wide and 3 in thick, and a web 6 in deep and 6 in thick. The overall depth is 9 in and the section is symmetric about the vertical axis. The section is subjected to a vertical shear of 10 kip, determine the vertical shear force resisted by the flange.\nAns. 3.05kip' },
    { id: 'M49', text: 'A cruciform section is 350 mm wide and 350 mm deep and the elements are all 50 mm thick. The section is symmetric about both horizontal and vertical axes. The section is subjected to a vertical shear of 130 kN. Determine the resultant shear force developed in the vertical segment element.\nAns. 50.3kN' },
    { id: 'M50', text: 'A solid steel rod has a radius of 1.25 in. If it is subjected to a shear force of 5 kip determine the maximum shear stress.\nAns. 1.36ksi' },
    { id: 'M51', text: 'A horizontal cantilever beam is 800 mm long and fixed at the left end A. Point B is 250 mm from A, point C is 500 mm from A, point D is 800 mm from A at the free end. Downwards loads are 2 kN at C and 4 kN at D. The cross-section is an inverted T section, with the flange at the bottom. The web is 70 mm deep, the flange is 50 mm wide, both elements are 20 mm thick, and the total height is 90 mm. Determine the maximum shear stress acting in the section at point B.\nAns. 4.85MPa' },
    { id: 'M52', text: 'An unequal flange I-section has a top flange 10 in wide, bottom flange 6 in wide and web 12 in deep. The web is 1 in thick and the flanges are 1.5 in thick, such that the section is 15 in deep. The web is aligned with the y axis and the section is symmetric about the y axis. The cross-section is fabricated from 3 timber boards that are nailed together. The vertical shear force is 5 kip and each nail can support a shear force of 500 lb. Determine the spacing of the nails used to hold the top and bottom flanges to the web.\nAns. top spacing = 1.42in, bottom spacing is 1.69in' },
    { id: 'M53', text: 'A thin-walled rectangular hollow section is 100 mm wide and 200 mm deep. There is a slit along its side located at the mid-height of the right web. Determine the horizontal location of the shear centre as the horizontal distance from the centreline of the left web.\nAns. 70mm' },
  ],
  'Combined loadings': [
    { id: 'M54', text: 'A spherical gas tank has an inner radius of 1.5 m. If it is subjected to an internal pressure of 300 kPa, determine its required thickness if the maximum normal stress is not to exceed 12 MPa.\nAns. 18.8mm' },
    { id: 'M55', text: 'A gas pipe line is supported every 20 ft by concrete piers and also lays on the ground. If there are rigid retainers at the piers that hold the pipe fixed, determine the longitudinal and hoop stress in the pipe if the temperature rises 60 degrees F from the temperature at which it was installed. The gas within the pipe is at a pressure of 600 lb/in^2. The pipe has an inner diameter of 20 in. and thickness of 0.25 in. The material is A-36 steel, use a coefficient of thermal expansion of 6.6(10^-6)/degrees F, and modulus of elasticity of 29(10^3) ksi.\nAns. longitudinal = 11.5ksi, hoop = 24ksi' },
    { id: 'M56', text: 'A plate with negligible weight is fixed at its top, is 200 mm wide, 800 mm deep and 10 mm thick. A force is applied at the bottom of the plate at the mid-thickness. Determine the shortest distance to the edge of the plate at which the force can be applied so that it produces no compressive stress at a section 300 mm from the top support.\nAns. 66.7mm' },
    { id: 'M57', text: 'A steel I-section has flanges 4 in wide and a web 6 in deep, both 0.5 in thick, such that the total depth is 7 in. The web is aligned with the y axis and the section is symmetric about the x and y axes. The section is the cross-section of a simply supported 16 ft long beam, with downwards loads located from the left end A of: 500 lb 2 ft from A, 2500 lb 6 ft from A and 3000 lb 10 ft from A. Determine the stress components at a point 4 ft from A, located at the centre width and the top surface of the top flange.\nAns. longitudinal stress = -9.41 ksi (C), shear stress = 0ksi' },
    { id: 'M58', text: 'A bar having a square cross section of 30 mm by 30 mm is 2 m long and is held upward. If it has a mass of 5 kg/m, determine the largest angle measured from the vertical, at which it can be supported before it is subjected to a tensile stress along its axis near the grip.\nAns. 0.286 degrees' },
    { id: 'M59', text: 'A rectangular road sign is fixed to a 6 m tall post, and has horizontal dimension 2 m (along the y axis) and vertical dimension 1 m (z axis). The sign is attached to the post along one of its vertical edges, such that it cantilevers out from the top 1 m of the post. The sign is subjected to a horizontal uniform wind loading of 1.5 kPa (in the x direction). The circular post has a diameter of 100 mm. The x and y axes are defined such that the origin is at the centre of the circular cross-section, and the y axis aligns with the y axis of the sign. Determine the stress components in the post a distance of 2 m above the ground, at the section locations where the section crosses the x and y axes.\nAns. stress in MPa: +x-axis (50, 0) normal stress=106.9 (T), shear stress=15.28; -x axis (-50, 0) normal stress=-106.9 (C), shear stress=15.28; +y axis (0, 50) normal stress=0, shear stress=14.77; -y axis (0, -50) normal stress=0, shear stress=14.77' },
  ],
  'Stress transformation': [
    { id: 'M60', text: 'An element is subjected to a normal y stress of 300 psi compression and a shear stress of 950 psi (positive upwards on the right side). Determine the equivalent state of stress if the element is rotated 30 degrees clockwise.\nAns. s_x\' = -897.7 psi (compression), s_y\' = 597.7 psi (tension), t_x\'y\' = 604.9 psi' },
    { id: 'M61', text: 'The state of stress on an element is: Normal stress s_y = 60 MPa (compressive), Normal stress s_x = 45 MPa (tensile), Shear stress t_xy = 30 MPa (positive acting upward on right face). Determine the principal stresses and the maximum in-plane shear stress and their orientations.\nAns. s_1 = 53MPa, s_2 = -68MPa, orientation_1 = 14.9 degrees, orientation_2 = -75.1 degrees, t_max-in-plane = 60.5MPa, orientation = -30.1 degrees' },
    { id: 'M62', text: 'A plane a-a is horizontal and a plane b-b interests it at an angle of 60 degrees clockwise from plane a-a. The stresses along planes a-a and b-b are 45MPa to the right and 25MPa upwards and leftwards, respectively. Determine the normal stress on plane b-b and the principal stresses.\nAns. s_b = 121MPa, s_1 = 126MPa, s_2 = -16.1MPa' },
    { id: 'M63', text: 'A wooden block will fail if the shear stress acting along the grain is 550 psi. The grain is oriented 58 degrees CCW from the positive x axis. If the normal stress s_x = 400 psi, determine the necessary compressive stress s_y that will cause failure.\nAns. -824 psi' },
    { id: 'M64', text: 'A rod has a circular cross section with a diameter of 2 in. It is subjected to a torque of 12 kip.in. and a bending moment M. The greater principal stress at the point of maximum flexural stress is 15 ksi. Determine the magnitude of the bending moment.\nAns. 8.73kip.in' },
    { id: 'M65', text: 'A solid rod with radius 25 mm is fixed at the wall and subjected to a torque about the longitudinal axis positive away from the wall of +45 Nm, a moment of 300 Nm causing compression to the top surface of the rod, and a downward force at the free end of 800 N. Determine the principle stresses acting at a point at the top surface a distance of 450 mm from the free end.\nAns. s_1 = 5.5MPa, s_2 = -0.611MPa' },
    { id: 'M66', text: 'A cylindrical pressure vessel has an inner radius of 1.25 m and a wall thickness of 15 mm. It is made from steel plates that are welded along the 45 degrees seam. Determine the normal and shear stress components along this seam if the vessel is subjected to an internal pressure of 8 MPa.\nAns. normal = 500MPa, shear = 167MPa' },
  ],
  'Strain transformation': [
    { id: 'M67', text: 'A differential element on a bracket is subjected to plane strain that has the following components: e_x = 150(10^-6), e_y = 200(10^-6), gamma_xy = -700(10^-6). Determine the equivalent in-plane strains on an element oriented at an angle of theta = 60 degrees counterclockwise from the original position.\nAns. e_x = -116(10^-6), e_y = 466(10^-6), gamma_xy = 393(10^-6)' },
    { id: 'M68', text: 'The state of strain at a point on a wrench has components e_x = 120(10^-6), e_y = -180(10^-6), gamma_xy = 150(10^-6). Determine the in-plane principal strains and the maximum in-plane shear strain and average normal strain.\nAns. e_1 = 138(10^-6), e_2 = -198(10^-6), gamma_max = 335(10^-6), e_ave = -30(10^-6)' },
    { id: 'M69', text: 'A steel bar has dimensions 15 in x 2 in x 0.5 in and is subjected to a 500 lb tensile load in the direction of the 15 in dimension. Determine the maximum shear strain. E = 29(10^3) ksi, Poisson\'s ratio is 0.3.\nAns. 22.4(10^-6)' },
    { id: 'M70', text: 'A 45 degrees strain rosette is mounted on a machine element. The following readings are obtained from each gauge: e_upwards = 650(10^-6), e_diagonal = -300(10^-6), e_left = 480(10^-6). Determine the in-plane principal strains and the maximum in-plane shear strain and associated average normal strain.\nAns. e_1 = 1434(10^-6), e_2 = -304(10^-6), gamma_max = 1738(10^-6), e_ave = 565(10^-6)' },
    { id: 'M71', text: 'A bar of copper alloy is loaded in a tension machine and it is determined that e_x = 940(10^-6) and sigma_x = 14 ksi, sigma_y = 0, sigma_z = 0. Determine the modulus of elasticity and the dilatation of the copper. Poisson\'s ratio = 0.35.\nAns. E = 14.9(10^3)ksi, dilation = 0.282(10^-3)' },
    { id: 'M72', text: 'A thin-walled cylindrical pressure vessel is 3 m long and has an inner radius of 0.5 m and a thickness of 10 mm, and is filled with air having an internal gauge pressure of 15 MPa. Determine the strains in the circumferential and longitudinal directions, and the increase in both the diameter and the length. E = 200 GPa, Poisson\'s ratio = 0.3.\nAns. e_circum = 3.188(10^-3), e_long = 0.75(10^-3), diameter increase = 3.19mm, length increase = 2.25mm' },
    { id: 'M73', text: 'An aluminium alloy with yield stress 37 ksi is to be used for a solid shaft that transmits 40 hp at 2400 rev/min. Using a factor of safety of 2 with respect to yielding, determine the smallest diameter shaft that can be used based on maximum shear stress theory.\nAns. 0.833 in' },
  ],
  'Design of beams and shafts': [
    { id: 'M74', text: 'A continuous beam is made of timber that has an allowable bending stress of 6.5 MPa and an allowable shear stress of 500 kPa. The beam is 8 m long and rests on supports that are 4 m apart, with 2 m long overhangs at both ends. Determine its cross section dimensions if it is to be rectangular and have a height-to-width ratio of 1.25.\nAns. 211mm wide and 264mm deep' },
    { id: 'M75', text: 'A 4 m long steel cantilever beam is fixed at the left end and has downwards loads each of magnitude P that are located 2 m from A and 4 m from A. The cross-section is a T section with dimensions: flange width 150 mm, web depth 150 mm, both elements are 15 mm thick, such that the total height is 165 mm. Determine the maximum loads P that can be safely supported on the beam if the allowable bending stress is 170 MPa and the allowable shear stress is 95 MPa.\nAns. 2.9kN' },
    { id: 'M76', text: 'A steel I-section has flanges with unknown width and a web 7 in deep, both 0.5 in thick, such that the total depth is 8 in. The web is aligned with the y axis and the section is symmetric about the x and y axes. The section is used as a 20 ft long simply supported beam with loads of 6 kip acting downward at 6 ft from left end and 8 kip acting downward at 14 ft from left end. If the maximum bending stress is not to exceed 22 ksi, determine the required width of the flanges.\nAns. 5.86in' },
    { id: 'M77', text: 'Two pulleys of radius 0.5 ft are attached to an 8 ft long shaft and loaded. The ends of the shaft are supported by bearings that exert only horizontal and vertical forces on the shaft. The dimensions are: Point A: x = 0 (left bearing), Point D: x = 1 ft (first pulley), Point C: x = 6 ft (second pulley), Point B: x = 8 ft (right bearing). The loads on each side of the pulley at D are downwards 150 lb and 250 lb. The loads on each side of the pulley at C are 150 lb and 250 lb horizontal and perpendicular to the longitudinal axis of the shaft. Determine the required diameter of the shaft if the allowable shear stress is 12 ksi.\nAns. 1.46in' },
    { id: 'M78', text: 'A 500 mm long tubular shaft has an inner diameter of 15 mm. The shaft is supported by bearings that are 200 mm apart, such that the shaft has 150 mm overhangs from the bearings on each side. The bearings exert only horizontal and vertical forces on the shaft. Both shaft ends have a gear attached with radius 100 mm. The load on the gear at one end is 500 N horizontal and perpendicular to the longitudinal axis of the shaft, and the other end has a load on the gear of 500 N downwards. Determine the outer diameter if the allowable shear stress is = 70 MPa.\nAns. 20.8mm' },
  ],
  'Beam deflections': [
    { id: 'M79', text: 'A simply supported beam is 12 ft long and has a downwards uniformly distributed load of 80 lb/ft over the central 8 ft of the beam. Determine the maximum deflection of the beam as a function of the constant EI.\nAns. 18.8/EI kip.ft^3 downwards' },
    { id: 'M80', text: 'A 60 in long shaft has dimensions: A (x = 0) left end, B (x = 12 in), C (x = 36 in) and D (x = 60 in) right end. The shaft is supported by bearings at B and D. The bearings exert only horizontal and vertical forces on the shaft. Downwards loads are 50 lb at A and 80 lb at C. Determine the slope of the shaft at A as a function of the constant EI.\nAns. -1920/EI lb.in^2' },
    { id: 'M81', text: 'A 6 m long cantilever beam is fixed at the left end and has dimensions: A (x = 0) fixed end, B (x = 3 m), C (x = 4.5 m) and D (x = 6 m) free end. Downwards loads are: a uniformly distributed load of 2 kN/m from A to B, 4 kN at C and 6 kN at D. The beam is rectangular 200 mm wide and 400 mm deep, and made of timber with E = 12 GPa. Determine the deflection at the free end D.\nAns. 51.7mm downwards' },
    { id: 'M82', text: 'A 16 ft long simply supported beam has downwards uniformly distributed load of 6 kip/ft over the left half (8 ft) and a CCW moment of 5 kip.ft at the right end. The beam is a steel section with I = 82.8 in^4 and E = 29,000 ksi. Determine the deflection at the centre of the beam.\nAns. 1.9in' },
    { id: 'M83', text: 'A 200 mm long cantilever beam is fixed at the left end and supported by a spring at the right end. The spring has a stiffness of k = 2 N/mm. The beam is rectangular 5 mm wide and 10 mm deep. A downwards load of 50 N is applied at the right end. The steel is A-36 and E is 29,000 ksi. Determine the deflection at the right end.\nAns. 1.5mm' },
    { id: 'M84', text: 'A beam has length (a + L) and has dimensions: D (x = 0) left end, A (x = a), C (x = a + L/2) and B (x = a + L). The beam is simply supported at B and rests on a roller at A. Downwards loads of magnitude P are located at both D and C. Determine the value of a (as a proportion of L) such that the deflection at C is equal to zero. EI is constant. Use the moment-area theorems.\nAns. a = L/3' },
    { id: 'M85', text: 'A 8 m long continuous beam has supports: the left end rests on a roller (A), the centre of the beam rests on a roller (B) and the beam is pinned at the right end (C). A downwards uniformly distributed load of 8 kN/m is applied over the full length. Use discontinuity functions to determine the reactions at the supports. EI is constant.\nAns. Ay = 12kN, By = 40kN, Cy = 12kN' },
    { id: 'M86', text: 'A 4 m long shaft is supported by 3 bearings at A (x = 0), B (x = 2) and C (x = 4). A downwards force of 200 N is applied at the centre of segment AB (x = 1). The bearings exert only vertical reactions on the shaft. Determine these reactions using the moment-area theorems.\nAns. Ay = 81.3N, By = 138N, Cy = -18.8N' },
  ],
  'Buckling': [
    { id: 'M87', text: 'An 18 in long solid circular rod from A-36 steel has pinned ends and is subjected to an axial compressive load of 4 kip. Determine the smallest diameter of the rod such that it does not buckle.\nAns. 0.551in' },
    { id: 'M88', text: 'A W12 x 87 structural A-36 steel column has a length of 12 ft. If its bottom end is fixed supported while its top is free, and it is subjected to an axial load of P = 380 kip, determine the factor of safety with respect to buckling. Section Properties (W12 x 87): A = 25.6 in^2, I_x = 740 in^4, I_y = 241 in^4 (controls)\nAns. 2.19' },
    { id: 'M89', text: 'An A-36 steel pipe has an outer diameter of 2 in. and a thickness of 0.5 in. The pipe has a height of 12 ft and it is held in place by a guywire. The guywire connects from the top of the pipe to a ground anchor, where the horizontal distance to the guywire anchor is 5 ft. Assume that the ends of the pipe are pin connected. Determine the largest horizontal force P that can be applied to the top of the pipe without causing the pipe to buckle.\nAns. 4.23kip' },
    { id: 'M90', text: 'A truss is made from A-36 steel bars, each of which has a solid circular cross section. The joints are located at: Joint A: (0, 0 ft), Joint B: (8, 0 ft), Joint D: (8, 3 ft), Joint C: (4, 3 ft). Members are: AB, AC, BC, CD. Joints B and D are pinned. A downwards force of 10 kip is applied at A. Determine the diameter of member AB that will prevent this member from buckling. The members are pin supported at their ends.\nAns. 1.72in' },
    { id: 'M91', text: 'A steel bar AB of a frame is pin-connected at its ends. Joints are C (0,0 m), A (3, 4 m), B (3, -2 m). Supports B and C are pinned, and members AC and AB are pinned at A. A horizontal force of 18 kN is applied at A. The bar AB is rectangular 50 mm wide and 100 mm deep, with properties of E_st = 200 GPa, yield stress = 360 MPa. Determine the factor of safety with respect to buckling.\nAns. 2.38' },
    { id: 'M92', text: 'A steel W8 x 15 column has a height of 8 ft and is fixed at the base and free at the top. The cross-section is oriented such that the web of the section is aligned with the y axis. An axial compressive force is applied at the top, located on the cross section 1 in along the y axis below the section centroid. Determine the maximum load that can be applied. A = 4.44 in^2, I_x = 48.0 in^4, I_y = 3.41 in^4, r_x = 3.29 in., depth = 8.11 in.\nAns. 26.5 kip' },
    { id: 'M93', text: 'A solid aluminium rod with diameter 200 mm is fixed at its base, free at the top, with a height of L m. An axial compressive force of 200 kN is applied eccentrically to the centroid of the cross section by 5 mm. Determine the greatest height L of the rod such that it does not buckle. E = 72 GPa, yield stress = 410 MPa.\nAns. 8.34m' },
  ],
  'Energy methods': [
    { id: 'M94', text: 'An A-36 steel shaft with radius 30 mm is subjected to two torques of 4 kN.m and 3 kN.m separated by 0.5 m and acting in opposite directions. The shaft extends 0.5 m away from each torque, such that the rod has total length 1.5 m. Determine the torsional strain energy.\nAns. 26.2 J' },
    { id: 'M95', text: 'An A-36 steel beam is simply supported and 10 m long. A downwards uniformly distributed load of 1.5 kN/m is applied to the full length, and an axial tension force of 15 kN is applied at the end with a roller. A = 2300 mm^2, I = 9.5(10^6) mm^4. Determine the total strain energy.\nAns. 496 J' },
    { id: 'M96', text: 'A solid circular concrete column has a height of 5 ft and radius of 12 in. The column contains six 1 in. diameter steel reinforcing rods. If the column supports a load of 300 kip, determine the strain energy in the column. E_st = 29(10^3) ksi, E_c = 3.6(10^3) ksi.\nAns. 0.129 ft.kip' },
    { id: 'M97', text: 'An A-36 steel 25 ft long cantilever beam is fixed at its left end. A downwards load of 8 kip is applied at 15 ft from the fixed end. Determine the displacement beneath the load using work and energy methods. I = 250 in^4.\nAns. 2.15in' },
    { id: 'M98', text: 'A steel cable having a diameter of 0.4 in. wraps over a drum and is used to lower an elevator having a weight of 800 lb. The elevator is 150 ft below the drum and is descending at the constant rate of 2 ft/s when the drum suddenly stops. Determine the maximum stress developed in the cable when this occurs. E = 29(10^3) ksi, yield stress = 50 ksi.\nAns. 20.3ksi' },
    { id: 'M99', text: 'A steel chisel has a diameter of 0.5 in. and a length of 10 in. It is struck by a hammer that weighs 3 lb, and at the instant of impact it is moving at 12 ft/s. Determine the maximum compressive stress in the chisel, assuming that 80% of the impacting energy goes into the chisel. E = 29(10^3) ksi, yield stress = 100 ksi.\nAns. 43.6MPa' },
    { id: 'M100', text: 'An A-36 steel bolt is required to absorb the energy of a 2 kg mass that falls 30 mm. If the bolt has a diameter of 4 mm, determine its required length so the stress in the bolt does not exceed 150 MPa.\nAns. 850mm' },
  ],
};

const TOPICS = Object.keys(QUESTIONS_DB);

const SYSTEM_MESSAGE = "Positive x-axis right, positive y-axis upwards. If the answer is provided it will come after: Ans.  Check your answer against this since it is the correct answer. Return all your thinking and reasoning inside your <think> </think> tags. After the closing </think> tag provide this specific output: Return 4 PLAIN TEXT sentences summarising the 4 key solution steps (one sentence for each key step), and the final answer, in PLAIN ITEXT and with units. If the solution requires to calculate reaction forces, also state the reactions forces. YOU MUST USE PLAIN TEXT IN THE RESPONSE";

const API_KEY_STORAGE_KEY = 'huggingface_api_key';

// Function to get display version of question (without answer)
const getDisplayQuestion = (question) => {
  // Remove everything from "Ans." onwards (case insensitive)
  return question.replace(/\nAns\..*$/is, '').trim();
};

export default function App() {
  const [screen, setScreen] = useState('loading'); // loading, welcome, apiKeyCheck, apiKeyEntry, chooseInput, ownQuestion, selectTopic, result
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [displayQuestion, setDisplayQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAiInfo, setShowAiInfo] = useState(false);

  // Load API key on app start - always go to welcome screen first
  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const storedKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
      if (storedKey) {
        setApiKey(storedKey);
      }
      // Always show welcome screen first, regardless of API key status
      setScreen('welcome');
    } catch (err) {
      console.error('Error loading API key:', err);
      setScreen('welcome');
    }
  };

  const saveApiKey = async (key) => {
    try {
      await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
      setApiKey(key);
      setScreen('chooseInput');
    } catch (err) {
      Alert.alert('Error', 'Failed to save API key securely.');
    }
  };

  const handleGetStarted = () => {
    // Check if API key exists when Get Started is clicked
    if (apiKey) {
      setScreen('chooseInput');
    } else {
      setScreen('apiKeyCheck');
    }
  };

  const handleApiKeyResponse = (hasKey) => {
    setHasExistingKey(hasKey);
    setScreen('apiKeyEntry');
  };

  const handleApiKeySubmit = () => {
    if (apiKeyInput.trim()) {
      saveApiKey(apiKeyInput.trim());
    } else {
      Alert.alert('Error', 'Please enter a valid API key.');
    }
  };

  const resetApiKey = async () => {
    Alert.alert(
      'Reset API Key',
      'Are you sure you want to remove your API key?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
              setApiKey('');
              setApiKeyInput('');
              setScreen('apiKeyCheck');
            } catch (err) {
              Alert.alert('Error', 'Failed to reset API key.');
            }
          },
        },
      ]
    );
  };

  const selectRandomQuestion = (topic) => {
    const questions = QUESTIONS_DB[topic];
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
    setSelectedQuestion(question.text);
    setDisplayQuestion(getDisplayQuestion(question.text));
    submitQuestion(question.text);
  };

  const submitQuestion = async (question) => {
    setIsLoading(true);
    setError('');
    setResponse('');
    setScreen('result');

    try {
      // Using XMLHttpRequest for streaming support in React Native
      const xhr = new XMLHttpRequest();
      let fullContent = '';

      await new Promise((resolve, reject) => {
        xhr.open('POST', 'https://router.huggingface.co/v1/chat/completions', true);
        xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);
        xhr.setRequestHeader('Content-Type', 'application/json');

        let lastProcessedIndex = 0;

        xhr.onprogress = () => {
          const newData = xhr.responseText.substring(lastProcessedIndex);
          lastProcessedIndex = xhr.responseText.length;

          const lines = newData.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                }
              } catch (e) {
                // Skip invalid JSON lines
              }
            }
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject({ status: xhr.status, message: xhr.statusText });
          }
        };

        xhr.onerror = () => {
          reject({ message: 'Network error' });
        };

        xhr.send(JSON.stringify({
          model: 'Qwen/Qwen3-235B-A22B-Thinking-2507:novita',
          messages: [
            { role: 'system', content: SYSTEM_MESSAGE },
            { role: 'user', content: question },
          ],
          max_tokens: 4096,
          temperature: 0.6,
          top_p: 0.95,
          stream: true,
        }));
      });

      // Remove <think>...</think> blocks (including the tags)
      let cleanContent = fullContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      // Also handle case where only </think> appears (opening tag may be implicit)
      cleanContent = cleanContent.replace(/^[\s\S]*?<\/think>/g, '').trim();

      // Check if content is empty after stripping think tags
      if (cleanContent) {
        setResponse(cleanContent);
      } else {
        setError('The AI was still thinking when the response ended. Please try again.');
      }
    } catch (err) {
      console.error('API Error:', err);
      if (err.status === 401) {
        setError('Invalid API key. Please check your Hugging Face API key.');
      } else if (err.status === 429) {
        setError('Rate limit exceeded. Please wait a moment and try again.');
      } else if (err.status === 404) {
        setError('Model not found. The model may not be available through this provider. Try again later or contact support.');
      } else if (err.status === 504) {
        setError('The server timed out while processing your request. This can happen with complex questions. Please try again.');
      } else {
        setError(err.message || 'Failed to get response from AI.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnQuestionSubmit = () => {
    if (questionText.trim()) {
      setSelectedQuestion(questionText.trim());
      setDisplayQuestion(questionText.trim()); // User's own questions show as-is
      submitQuestion(questionText.trim());
    } else {
      Alert.alert('Error', 'Please enter a question.');
    }
  };

  const goToStart = () => {
    setQuestionText('');
    setSelectedQuestion('');
    setDisplayQuestion('');
    setResponse('');
    setError('');
    setScreen('chooseInput');
  };

  const openLink = (url) => {
    Linking.openURL(url);
  };

  // Loading Screen
  if (screen === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Welcome Screen - Always shown first
  if (screen === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>⚙️ Mechanics Solver AI</Text>
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeText}>
              Hello! I can solve Engineering Mechanics of Materials questions.
            </Text>
            <Text style={styles.welcomeText}>
              I send your question to an open source AI at Hugging Face, so you need to get their free tier account and free API Key:
            </Text>
            <TouchableOpacity onPress={() => openLink('https://huggingface.co/')}>
              <Text style={styles.link}>https://huggingface.co/</Text>
            </TouchableOpacity>
            <Text style={styles.welcomeText}>
              {'\n'}I may be wrong sometimes, but its been shown that the AI I use performs well on engineering problems.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, styles.fullWidth]}
            onPress={handleGetStarted}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          {apiKey ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonOutline, styles.fullWidth]}
              onPress={resetApiKey}
            >
              <Text style={styles.buttonTextOutline}>Reset API Key</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // API Key Check Screen
  if (screen === 'apiKeyCheck') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Mechanics Solver</Text>
          <Text style={styles.subtitle}>Do you have a Hugging Face API key?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => handleApiKeyResponse(true)}
            >
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => handleApiKeyResponse(false)}
            >
              <Text style={styles.buttonTextSecondary}>No</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // API Key Entry Screen
  if (screen === 'apiKeyEntry') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Enter API Key</Text>
          {!hasExistingKey && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Please visit Hugging Face to sign up for free and generate an API key:
              </Text>
              <TouchableOpacity onPress={() => openLink('https://huggingface.co/')}>
                <Text style={styles.link}>https://huggingface.co/</Text>
              </TouchableOpacity>
              <Text style={styles.infoText}>
                {'\n'}After signing up, go to Settings → Access Tokens to create a new token.
              </Text>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder="Enter your Hugging Face API key"
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, styles.fullWidth]}
            onPress={handleApiKeySubmit}
          >
            <Text style={styles.buttonText}>Save API Key</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Choose Input Type Screen
  if (screen === 'chooseInput') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Choose Question Type</Text>
          <Text style={styles.subtitle}>
            Would you like to select an example question or submit your own?
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, styles.fullWidth]}
            onPress={() => setScreen('selectTopic')}
          >
            <Text style={styles.buttonText}>Select Example Question</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, styles.fullWidth]}
            onPress={() => setScreen('ownQuestion')}
          >
            <Text style={styles.buttonTextSecondary}>Submit My Own Question</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Own Question Screen
  if (screen === 'ownQuestion') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Enter Your Question</Text>
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>Instructions:</Text>
            <Text style={styles.instructionsText}>Use text-only, state units (imperial/metric are ok), + x-axis right, + y-axis up (you can go back and view an example question for correct format)</Text>
          </View>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textAreaInput}
              placeholder="Enter your mechanics question here..."
              placeholderTextColor="#9ca3af"
              value={questionText}
              onChangeText={setQuestionText}
              multiline={true}
              textAlignVertical="top"
              underlineColorAndroid="transparent"
              autoCorrect={false}
              autoCapitalize="sentences"
              returnKeyType="default"
              blurOnSubmit={false}
            />
          </View>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, styles.fullWidth]}
            onPress={handleOwnQuestionSubmit}
          >
            <Text style={styles.buttonText}>Submit Question</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, styles.fullWidth]}
            onPress={() => setShowAiInfo(true)}
          >
            <Text style={styles.buttonTextSecondary}>Can AI write this?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonOutline, styles.fullWidth]}
            onPress={() => setScreen('chooseInput')}
          >
            <Text style={styles.buttonTextOutline}>Back</Text>
          </TouchableOpacity>

          {showAiInfo && (
            <View style={styles.aiInfoOverlay}>
              <View style={styles.aiInfoBox}>
                <Text style={styles.aiInfoText}>
                  I have trialled both open and closed LLMs to convert Mechanics problem diagrams to text, and none do this perfectly. Particularly, complex diagrams are often incorrect. Thus I haven't added this feature to the app, since if the text input is wrong the AI will solve the wrong problem. You can try the top models (eg Opus 4.5 or Gemini 3) or some VL-specific models yourself, but check the text carefully. Searchable PDFs work better than image PDFs, image files or photos.
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary, styles.fullWidth]}
                  onPress={() => setShowAiInfo(false)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Select Topic Screen
  if (screen === 'selectTopic') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Select a Topic</Text>
          <Text style={styles.subtitle}>
            A random question will be selected from your chosen topic.
          </Text>
          {TOPICS.map((topic, index) => (
            <TouchableOpacity
              key={topic}
              style={[styles.topicButton]}
              onPress={() => selectRandomQuestion(topic)}
            >
              <Text style={styles.topicButtonText}>
                {index + 1}. {topic}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.button, styles.buttonOutline, styles.fullWidth, { marginTop: 20 }]}
            onPress={() => setScreen('chooseInput')}
          >
            <Text style={styles.buttonTextOutline}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Result Screen
  if (screen === 'result') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Solution</Text>
          
          <View style={styles.questionBox}>
            <Text style={styles.questionLabel}>Question:</Text>
            <Text selectable={true} style={styles.questionText}>{displayQuestion}</Text>
          </View>

          {isLoading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Solving your question...</Text>
              <Text style={styles.loadingSubtext}>This could take several minutes for complex questions, please wait. BTW if you run out of inference on Hugging Face you can subscribe and/or buy credits.</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {response && (
            <View style={styles.responseBox}>
              <Text style={styles.responseLabel}>AI Response:</Text>
              <Text selectable={true} style={styles.responseText}>{response}</Text>
            </View>
          )}

          {!isLoading && (
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, styles.fullWidth]}
              onPress={goToStart}
            >
              <Text style={styles.buttonText}>Solve Another Question</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
  },
  buttonSecondary: {
    backgroundColor: '#e2e8f0',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 8,
  },
  link: {
    color: '#2563eb',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  topicButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  topicButtonText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  instructionsBox: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  textAreaContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 150,
  },
  textAreaInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 150,
  },
  questionBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    lineHeight: 22,
  },
  responseBox: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 15,
    color: '#166534',
    lineHeight: 24,
  },
  aiInfoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  aiInfoBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  aiInfoText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 16,
  },
});
